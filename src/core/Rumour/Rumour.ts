import type { CeaseCallback, Collection, Patch, Resource, Share, TrackCallback } from './types';
import { get, isEqual } from 'lodash-es';

import { UpdateError } from './UpdateError.js';
import traverse from 'traverse';

/**
 * Rumour: schemaless state manager for `application/hal+json` resources.
 *
 * Unlike many other state managers, Rumour neither stores a global state nor
 * knows its structure – instead it links multiple local HAL+JSON states together
 * and keeps them in sync.
 *
 * To get started, subscribe your local state to Rumour updates using
 * the `.track()` method, and then subscribe Rumour to the local state updates
 * using the `.share()` method. Rumour will run the callback function passed to `.track()`
 * whenever an update becomes available, and if that update applies to your local state,
 * Rumour will recursively patch it on demand when you invoke `ctx.update()` from the callback.
 *
 * If you no longer need to receive updates, remember to unsubscribe
 * to avoid memory leaks (see `.track()` docs for more info).
 *
 * All updates are scoped to a Rumour instance, so if you share a resource to an
 * instance, only its own trackers will be notified.
 */
export class Rumour {
  static readonly UpdateError = UpdateError;

  private __callbacks: TrackCallback[] = [];

  share({ related, source, data }: Share): void {
    let patch: Patch;

    if (data === null) {
      const dataID = Rumour.__createResourceID({ _links: { self: { href: source } } });
      patch = new Map([[dataID, null]]);
    } else {
      patch = Rumour.__createPatch(data);
    }

    [...this.__callbacks].forEach(callback => {
      callback(oldData => {
        const newData = Rumour.__applyPatch(patch, oldData, related);
        return isEqual(oldData, newData) ? oldData : newData;
      });
    });
  }

  track(callback: TrackCallback): CeaseCallback {
    this.__callbacks.push(callback);
    return () => void this.__callbacks.splice(this.__callbacks.indexOf(callback), 1);
  }

  cease(): void {
    this.__callbacks.length = 0;
  }

  private static __isResource(json: unknown): json is Resource {
    return typeof get(json, '_links.self.href') === 'string';
  }

  private static __isCollection(json: unknown): json is Collection {
    return typeof get(json, '_links.first.href') === 'string';
  }

  private static __createResourceID(data: Resource): string {
    const url = new URL(data._links.self.href);

    if (Rumour.__isCollection(data)) {
      if (url.searchParams.get('offset') === '0') url.searchParams.delete('offset');
      if (url.searchParams.get('limit') === '20') url.searchParams.delete('limit');
    } else {
      url.search = '';
    }

    url.hash = '';

    return url.toString();
  }

  private static __createPatch(data: Resource): Patch {
    return traverse(data).reduce(function (patch: Patch, value) {
      if (!Rumour.__isResource(value)) return patch;

      const props = traverse(value).map(function () {
        if (this.key?.startsWith('_')) this.delete(true);
      });

      patch.set(Rumour.__createResourceID(value), props);
      return patch;
    }, new Map());
  }

  private static __applyPatch(patch: Patch, data: Resource, related?: ReadonlyArray<string>) {
    const relatedIDs = related?.map(href => {
      return Rumour.__createResourceID({ _links: { self: { href } } });
    });

    const result = traverse({ data }).map(function (node) {
      if (!Rumour.__isResource(node)) return;

      const id = Rumour.__createResourceID(node);
      if (relatedIDs?.includes(id)) throw new Rumour.UpdateError();
      if (!patch.has(id)) return;

      const props = patch.get(id);
      if (props === null) return this.delete(true);

      this.update({ ...node, ...props }, true);
    });

    return result.data ?? null;
  }
}
