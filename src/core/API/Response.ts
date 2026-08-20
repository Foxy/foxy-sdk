/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { FollowableResource } from '../FollowableResource';
import type { Graph } from '../Graph';
import type { Logger } from '../logger.js';
import { Node } from './Node.js';
import type { Query } from '../Query';
import { assertStorage } from '../guards.js';

/**
 * The native Response constructor, retyped without its `json()` method.
 *
 * `json()` is the one member this class overrides, and its return type,
 * {@link FollowableResource}, reaches back through {@link Node} to this class.
 * hAPI graphs have self-referencing links, so that type is legitimately
 * infinite. Checking the override against the base signature makes TypeScript
 * instantiate the class with `any`, which collapses every deferred conditional
 * in the chain and expands it forever. Hiding the base member removes the check
 * and leaves the type deferred, as it was under the TypeScript 4 of v1.
 */
const NativeResponse = globalThis.Response as unknown as {
  new (
    body?: ConstructorParameters<typeof globalThis.Response>[0],
    init?: ConstructorParameters<typeof globalThis.Response>[1]
  ): Omit<globalThis.Response, 'json'>;
  readonly prototype: Omit<globalThis.Response, 'json'>;
};

/** Options of {@link Response} constructor. */
type Init = ConstructorParameters<typeof globalThis.Response>[1] & {
  /** Custom Fetch API implementation for making authenticated requests. */
  fetch: typeof globalThis.fetch;
  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  cache: Storage;
  /** Shared {@link Logger} instance. */
  console: Logger;
  /** Response body. Streams aren't supported at the moment: https://github.com/github/fetch/issues/746#issuecomment-573701120. */
  body: Blob | BufferSource | FormData | URLSearchParams | string | null;
};

/**
 * Adds {@link Node} methods such as `.get()` or `.follow()` to each value in resource `_links`.
 *
 * @param params Response parameters and JSON.
 * @returns Enriched JSON including followable links.
 */
function addFollowableLinks<TGraph extends Graph, TQuery extends Query<TGraph> | undefined>(
  params: Pick<Init, 'cache' | 'console' | 'fetch'> & { json: Record<string, unknown> }
): FollowableResource<TGraph, TQuery> {
  const { json, ...nodeInit } = params;

  if ('_links' in json) {
    const links = (json as { _links: Record<string, { href: string }> })._links;

    json._links = Object.entries(links).reduce((links, [curie, link]) => {
      if (Array.isArray(link)) return { ...links, [curie]: link };

      const node = new Node({ ...nodeInit, path: [new URL(link.href)] });
      const methods = {
        delete: node.delete.bind(node),
        follow: node.follow.bind(node),
        get: node.get.bind(node),
        patch: node.patch.bind(node),
        post: node.post.bind(node),
        put: node.put.bind(node),
      };

      return { ...links, [curie]: { ...link, ...methods } };
    }, {});
  }

  if ('_embedded' in json) {
    const embeds = (json as { _embedded: Record<string, unknown> })._embedded;

    json._embedded = Object.entries(embeds).reduce(
      (embeds, [embedCurie, embedJSON]) =>
        Object.assign(embeds, {
          [embedCurie]: Array.isArray(embedJSON)
            ? embedJSON.map(itemJSON => addFollowableLinks({ ...nodeInit, json: itemJSON }))
            : addFollowableLinks({ ...nodeInit, json: embedJSON as Record<string, unknown> }),
        }),
      {}
    );
  }

  return json as FollowableResource<TGraph, TQuery>;
}

/**
 * Base class representing any response returned by API. Extends the native Response
 * object of Fetch API and has all the data of the original response in addition
 * to a few custom methods. You shouldn't need to construct instances of this
 * class directly unless you're building a custom API client with this SDK.
 */
export class Response<
  TGraph extends Graph,
  TQuery extends Query<TGraph> | undefined = undefined
> extends NativeResponse {
  /** Shared {@link Logger} instance. */
  protected readonly _console: Logger;

  /** Custom Fetch API implementation for making authenticated requests. */
  protected readonly _fetch: typeof globalThis.fetch;

  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  protected readonly _cache: Storage;

  constructor(init: Init) {
    if (typeof init !== 'object' || init === null) throw new TypeError('init must be an object.');

    assertStorage(init.cache, 'init.cache');
    if (typeof init.fetch !== 'function') throw new TypeError('init.fetch must be a function.');
    super(init.body, init);

    this._console = init.console;
    this._fetch = init.fetch;
    this._cache = init.cache;
  }

  /**
   * Gets JSON data from the response body and generates
   * a followable response with a number of shortcuts
   * for the most common actions.
   *
   * @returns Followable API response.
   */
  async json(): Promise<FollowableResource<TGraph, TQuery>> {
    const json = JSON.parse(await this.text()) as Record<string, unknown>;
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };
    return addFollowableLinks({ json, ...config });
  }
}
