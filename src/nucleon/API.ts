import { APIInit, ExposeInit, Patch, Unexpose } from './types';
import { applyPatch, getPatchKey, isResource, toPatch, toResourceWithHref } from './utils';

import { API } from '../core/API/API';
import { NucleonRequestEvent } from './RequestEvent';
import { isEqual } from 'lodash-es';
import traverse from 'traverse';

const exposedResources: Record<string, ExposeInit[]> = {};

export class NucleonAPI<TGraph> extends API<TGraph> {
  private readonly __element: EventTarget;

  private readonly __group: string;

  constructor(init: APIInit) {
    super({
      base: init.base,
      fetch: async (...args) => {
        const request = new Request(...args);
        let response = await this.__fetchFromExposedResources(request);

        if (response === null) {
          response = await this.__fetchFromAPI(request);
          if (response.ok) this.__sendUpdates(request, response);
        }

        return response;
      },
      level: init.level,
    });

    this.__group = init.group ?? 'default';
    this.__element = init.element;
  }

  /**
   * Makes HAPI resource available to other elements within the `Element#group`,
   * allowing multiple standalone elements on the page maintain a consistent
   * state. Here's how it works:
   *
   * 1. When making a GET request using this instance, it will look for an exposed resource with matching URI first;
   * 2. If found, it will respond with that resource, otherwise it will send the request to the API adapter and wait for a response;
   * 3. Upon obtaining the response, this instance will cross-reference the resources embedded in the response and the ones exposed locally and update them.
   *
   * This way, if you have two elements displaying customer data, making a PUT/PATCH request
   * in one of them will seamlessly update the other immediatly after a 2xx response is received.
   * Standalone resources will receive a `null` update when updated; embedded resources will be
   * removed from the parent entirely.
   *
   * Additionally, exposed collections will be notified if a new item is added to them via POST.
   * The consumer code can then perform a full reload or insert that item into the stored collection
   * page where appropriate.
   *
   * @param init Resource getter, setter and push notifier
   * @returns Unexpose callback to unsubscribe from updates
   */
  expose<TResource>(init: ExposeInit<TResource>): Unexpose {
    const tag = (this.__element as Element).tagName?.toLowerCase();
    this._console.trace(`NucleonAPI: ${tag} subscribed to resource updates`);

    const resources = exposedResources[this.__group] ?? [];
    resources.push(init);
    exposedResources[this.__group] = resources;

    return () => {
      resources.splice(resources.indexOf(init), 1);
      this._console.trace(`NucleonAPI: ${tag} unsubscribed from resource updates`);
    };
  }

  private async __fetchFromExposedResources(request: Request) {
    if (request.method === 'GET' && exposedResources[this.__group]) {
      for (const resource of exposedResources[this.__group]) {
        const match = traverse(resource.get()).reduce(toResourceWithHref(request.url), null);
        if (match) return new Response(JSON.stringify(match));
      }
    }

    return null;
  }

  private async __fetchFromAPI(request: Request) {
    return new Promise<Response>((resolve, reject) => {
      const event = new NucleonRequestEvent({ reject, request, resolve });
      this.__element.dispatchEvent(event);
      if (!event.defaultPrevented) fetch(request).then(resolve).catch(reject);
    });
  }

  private async __sendUpdates(request: Request, response: Response) {
    const responseJSON = await response.clone().json();
    if (!isResource(responseJSON)) return;

    const responseJSONKey = getPatchKey(responseJSON);
    const patch = traverse(responseJSON).reduce(toPatch, new Map()) as Patch;
    if (request.method === 'DELETE') patch.set(responseJSONKey, null);

    // list of exposed resources may change while applying updates, so we use a shallow local copy
    const resources = [...(exposedResources[this.__group] ?? [])];

    for (const resource of resources) {
      const oldResource = resource.get();
      const newResource = traverse({ v: oldResource }).map(applyPatch(patch)).v ?? null;

      if (!isEqual(oldResource, newResource)) {
        const tag = (this.__element as Element).tagName?.toLowerCase();
        const link = oldResource?._links.self.href;
        const action = newResource ? 'updating' : 'deleting';

        this._console.info(`NucleonAPI: ${tag} ${action} ${link} in ${this.__group} group`);
        console.log(newResource);
        resource.set(newResource);
      }
    }
  }
}
