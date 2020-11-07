/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Consola } from 'consola';
import { Response as GlobalThisResponse } from 'cross-fetch';
import type { Graph } from '../Graph';
import { Node } from './Node';
import type { Query } from '../Query';
import type { Resource } from '../Resource';

/** Options of {@link Response} constructor. */
type Init = {
  /** Custom Fetch API implementation for making authenticated requests. */
  fetch: Window['fetch'];
  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  cache: Storage;
  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  console: Consola;
  /** Original API [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object. */
  response: globalThis.Response;
};

/**
 * Gets `json._links` if available.
 *
 * @param json Raw resource JSON.
 * @returns The `_links` record or an empty object if unavailable.
 */
function getLinks(json: object) {
  const links = (json as Record<string, unknown>)._links;
  return typeof links !== 'object' || !links ? {} : (links as Record<string, { href: string } | unknown[]>);
}

/**
 * Gets `json._embedded` if available.
 *
 * @param json Raw resource JSON.
 * @returns The `_embedded` record or an empty object if unavailable.
 */
function getEmbeds(json: object) {
  const embeds = (json as Record<string, unknown>)._embedded;
  return typeof embeds !== 'object' || !embeds ? {} : (embeds as Record<string, unknown>);
}

/**
 * Adds {@link Node} methods such as `.get()` or `.follow()` to each value in resource `_links`.
 *
 * @param params Response parameters and JSON.
 * @returns Enriched JSON including followable links.
 */
function addFollowableLinks<TGraph extends Graph, TQuery extends Query<TGraph> | undefined>(
  params: Omit<Init, 'response'> & { json: unknown }
): Resource<TGraph, TQuery> {
  const { json, ...nodeInit } = params;
  if (typeof json !== 'object' || !json) return json as Resource<TGraph, TQuery>;

  const _links = Object.entries(getLinks(json)).reduce((links, [curie, link]) => {
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

  const _embedded = Object.entries(getEmbeds(json)).reduce(
    (embeds, [embedCurie, embedJSON]) =>
      Object.assign(embeds, {
        [embedCurie]: Array.isArray(embedJSON)
          ? embedJSON.map(itemJSON => addFollowableLinks({ ...nodeInit, json: itemJSON }))
          : addFollowableLinks({ ...nodeInit, json: embedJSON }),
      }),
    {}
  );

  return ({ ...json, _embedded, _links } as unknown) as Resource<TGraph, TQuery>;
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
  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  protected readonly _console: Consola;

  /** Custom Fetch API implementation for making authenticated requests. */
  protected readonly _fetch: Window['fetch'];

  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  protected readonly _cache: Storage;

  constructor({ response, console, fetch, cache }: Init) {
    super(response.body, response);

    this._console = console;
    this._fetch = fetch;
    this._cache = cache;
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