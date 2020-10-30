import {
  APICurieChain,
  APIResponse,
  Curies,
  Flatten,
  Follow,
  Graph,
  IntersectionOfValues,
  Properties,
  Query,
  RequiredPropertyOf,
  ResponseJSON,
  ZoomIn,
  isQuery,
} from './internal';

import { APIResolutionError } from './APIResolutionError';
import { Consola } from 'consola';
import { Request } from 'cross-fetch';
import ow from 'ow';
import { QueryOrder, QueryZoom } from './types';

type FlatZoom<G extends Graph, Q> = Q extends Query<G> ? Flatten<Q['zoom']> : never;
type DeepZoom<G extends Graph, Q, R extends PropertyKey> = Q extends Query<G> ? { zoom: ZoomIn<Q['zoom'], R> } : never;

type EmbeddedRels<G extends Graph, Q> = FlatZoom<G, Q> | RequiredPropertyOf<G['zooms']>;
type EmbeddedGraph<G extends Graph, R extends PropertyKey> = Required<G['zooms']>[R];

type EmbeddedNodes<G extends Graph, Q = undefined> = G['child'] extends Graph
  ? Record<G['curie'], APIResponseNode<G['child'], Q>[]>
  : IntersectionOfValues<
      {
        [R in EmbeddedRels<G, Q>]: Record<
          EmbeddedGraph<G, R>['curie'],
          EmbeddedGraph<G, R>['child'] extends Graph
            ? APIResponseNode<EmbeddedGraph<G, R>['child'], DeepZoom<G, Q, R>>[]
            : APIResponseNode<EmbeddedGraph<G, R>, DeepZoom<G, Q, R>>
        >;
      }
    >;

/** Options of {@link APINode} constructor. */
export type APINodeInit = {
  /** Path to this resource node as base URL followed by a list of curies. */
  path: APICurieChain;
  /** Custom Fetch API implementation for making authenticated requests. */
  fetch: Window['fetch'];
  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  cache: Storage;
  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  console: Consola;
};

/** Options of {@link APIResponseNode} constructor. */
export type APIResponseNodeInit<G extends Graph, Q> = Omit<APINodeInit, 'path'> & {
  /** Resource data received with the API response. */
  json: ResponseJSON<G, Q>;
};

/**
 * Serializes object zoom definition using hAPI format.
 *
 * @param prefix Curie prefix.
 * @param zoom Zoom definition as object.
 * @returns Serialized zoom parameter value.
 */
function stringifyZoom(prefix: string, zoom: QueryZoom): string {
  const scope = prefix === '' ? '' : prefix + ':';

  if (typeof zoom === 'string') return scope + zoom;
  if (Array.isArray(zoom)) return zoom.map(v => stringifyZoom(prefix, v)).join();

  return Object.entries(zoom)
    .map(([key, value]) => stringifyZoom(scope + key, value))
    .join();
}

/**
 * Serializes object order definition using hAPI format.
 *
 * @param order Order definition as object.
 * @returns Serialized order parameter value.
 */
function stringifyOrder(order: QueryOrder): string {
  if (typeof order === 'string') return order;

  if (Array.isArray(order)) {
    return order.map(item => stringifyOrder(item)).join();
  }

  return Object.entries(order)
    .map(([key, value]) => `${key} ${value}`)
    .join();
}

/**
 * Base class representing a resource node that can be fetched,
 * created, updated or deleted. You shouldn't need to create instances
 * of this class unless you're building a custom API client with our SDK.
 */
export class APINode<G extends Graph> {
  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  protected readonly _console: Consola;

  /** Custom Fetch API implementation for making authenticated requests. */
  protected readonly _fetch: Window['fetch'];

  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  protected readonly _cache: Storage;

  /** Path to this resource node as base URL followed by a list of curies. */
  protected readonly _path: APICurieChain;

  constructor({ path, fetch, cache, console }: APINodeInit) {
    this._path = path;
    this._fetch = fetch;
    this._cache = cache;
    this._console = console;
  }

  async get(): Promise<APIResponse<G>>;

  async get<Q extends Query<G>>(query: Q): Promise<APIResponse<G, Q>>;

  /**
   * Resolves the URL of this node and sends a GET request
   * using provided parameters.
   *
   * @param query Query parameters such as zoom, fields etc.
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async get(query?: Query): Promise<APIResponse<G>> {
    ow(query, ow.optional.object.partialShape(isQuery));

    const url = await this._resolve();
    const { filters, fields, offset, limit, order, zoom } = query ?? {};

    if (filters !== undefined) {
      filters.forEach((filter: string) => {
        const params = new URLSearchParams(filter);
        [...params.entries()].forEach(([key, value]) => url.searchParams.append(key, value));
      });
    }

    if (fields !== undefined) url.searchParams.set('fields', fields.join(','));
    if (offset !== undefined) url.searchParams.set('offset', String(offset));
    if (limit !== undefined) url.searchParams.set('limit', String(limit));
    if (order !== undefined) url.searchParams.set('order', stringifyOrder(order));
    if (zoom !== undefined) url.searchParams.set('zoom', stringifyZoom('', zoom));

    const response = await this._fetch(new Request(url.toString()));
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    return new APIResponse({ ...config, response });
  }

  /**
   * Resolves the URL of this node and sends a PUT request
   * with provided properties, replacing the existing resource.
   *
   * @param body Complete resource object.
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async put(body: Properties<G>): Promise<APIResponse<G>> {
    ow(body, ow.object);

    const url = await this._resolve();
    const request = new Request(url.toString(), { body: JSON.stringify(body), method: 'PUT' });
    const response = await this._fetch(request);
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    return new APIResponse({ ...config, response });
  }

  /**
   * Resolves the URL of this node and sends a POST request
   * with provided properties, creating a resource or triggering an action.
   *
   * @param body Complete resource object.
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async post(body?: Properties<G>): Promise<APIResponse<G>> {
    ow(body, ow.any(ow.undefined, ow.object));

    const url = await this._resolve();
    const request = new Request(url.toString(), { body: JSON.stringify(body), method: 'POST' });
    const response = await this._fetch(request);
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    return new APIResponse({ ...config, response });
  }

  /**
   * Resolves the URL of this node and sends a PATCH request
   * with provided properties, updating this resource.
   *
   * @param body Partial resource object.
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async patch(body: Partial<Properties<G>>): Promise<APIResponse<G>> {
    ow(body, ow.object);

    const url = await this._resolve();
    const request = new Request(url.toString(), { body: JSON.stringify(body), method: 'POST' });
    const response = await this._fetch(request);
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    return new APIResponse({ ...config, response });
  }

  /**
   * Resolves the URL of this node and sends a DELETE request,
   * removing this resource.
   *
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async delete(): Promise<APIResponse<G>> {
    const url = await this._resolve();
    const request = new Request(url.toString(), { method: 'DELETE' });
    const response = await this._fetch(request);
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    return new APIResponse({ ...config, response });
  }

  /**
   * Resource path builder. Calling this method instructs our
   * SDK to find the provided curie in this resource's links and
   * navigate to its location on request.
   *
   * @param curie Curie to follow.
   * @returns Instance of {@link APINode} representing the resource at curie location.
   */
  follow<C extends Curies<G>>(curie: C): APINode<Follow<G, C>> {
    ow(curie as unknown, ow.string);

    const config = { cache: this._cache, console: this._console, fetch: this._fetch };
    const path = this._path.concat(curie as string) as APICurieChain;

    return new APINode({ ...config, path });
  }

  /**
   * Resolves resource URL from a curie chain. The first element in the path
   * must be a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL).
   *
   * @returns Resolved URL.
   * @throws Throws {@link APIResolutionError} when once of the resources can't be reached.
   */
  protected async _resolve(): Promise<URL> {
    if (this._path.length === 1) return this._path[0];

    const [baseURL, curie] = this._path;
    const key = `${baseURL.toString()} > ${curie}`;
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    this._console.trace(`Trying to resolve ${key}...`);
    const cachedURL = this._cache.getItem(key);

    if (cachedURL) {
      this._console.success(`Resolved ${key} to ${cachedURL.toString()} using cache.`);
      const reducedPath = [new URL(cachedURL), ...this._path.slice(2)] as APICurieChain;
      return new APINode({ ...config, path: reducedPath })._resolve();
    }

    const response = await this._fetch(baseURL.toString());

    if (response.ok) {
      const json = await response.json();
      const url = new URL(json._links[curie].href);
      const reducedPath = [url, ...this._path.slice(2)] as APICurieChain;

      this._cache.setItem(key, url.toString());
      this._console.trace(`Cached ${url.toString()} for ${key}.`);
      this._console.success(`Resolved ${key} to ${url.toString()} online.`);

      return new APINode({ ...config, path: reducedPath })._resolve();
    } else {
      this._console.error(`Failed to resolve ${key}.`);
      throw new APIResolutionError(response);
    }
  }
}

/**
 * Base class representing contents of the resource that were
 * received with API response either on demand or after creation, update or deletion.
 * You shouldn't need to create instances of this class unless you're
 * building a custom API client with our SDK.
 */
export class APIResponseNode<G extends Graph, Q = undefined> extends APINode<G> {
  /** Embedded resources. Same as `json._embedded`, but enhanced with {@link APIResponseNode} features. */
  readonly embeds: EmbeddedNodes<G, Q>;

  /** Own properties of this resource (excluding `_links` and `_embedded`). */
  readonly props: G['props'];

  constructor({ json, ...nodeInit }: APIResponseNodeInit<G, Q>) {
    super({ ...nodeInit, path: [new URL(json._links.self.href)] });

    this.embeds = Object.entries(json._embedded).reduce(
      (embeds, [embedCurie, embedJSON]) =>
        Object.assign(embeds, {
          [embedCurie]: Array.isArray(embedJSON)
            ? embedJSON.map(itemJSON => new APIResponseNode({ ...nodeInit, json: itemJSON }))
            : new APIResponseNode({ ...nodeInit, json: embedJSON }),
        }),
      {}
    ) as EmbeddedNodes<G, Q>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _embedded, _links, ...props } = json as Record<string, unknown>;
    this.props = props;
  }
}
