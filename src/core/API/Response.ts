/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import consola, { Consola } from 'consola';
import { storageV8N, v8n } from '../v8n.js';

import { Response as GlobalThisResponse } from 'cross-fetch';
import type { Graph } from '../Graph';
import { Node } from './Node.js';
import type { Query } from '../Query';
import type { Resource } from '../Resource';

/** Options of {@link Response} constructor. */
type Init = ConstructorParameters<typeof globalThis.Response>[1] & {
  /** Custom Fetch API implementation for making authenticated requests. */
  fetch: Window['fetch'];
  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  cache: Storage;
  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  console: Consola;
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
): Resource<TGraph, TQuery> {
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

  return json as Resource<TGraph, TQuery>;
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
> extends GlobalThisResponse {
  static readonly v8n = {
    constructor: v8n().schema({
      cache: storageV8N,
      console: v8n().instanceOf(consola.constructor),
      fetch: v8n().typeOf('function'),
    }),
  };

  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  protected readonly _console: Consola;

  /** Custom Fetch API implementation for making authenticated requests. */
  protected readonly _fetch: Window['fetch'];

  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  protected readonly _cache: Storage;

  constructor(init: Init) {
    Response.v8n.constructor.check(init);
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
  async json(): Promise<Resource<TGraph, TQuery>> {
    const json = await super.json();
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };
    return addFollowableLinks({ json, ...config });
  }
}
