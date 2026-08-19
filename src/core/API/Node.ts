import { assertCurie, assertCurieChain, assertQuery, assertStorage } from '../guards.js';

import type { Graph } from '../Graph';
import type { Logger } from '../logger.js';
import type { Query } from '../Query';
import { ResolutionError } from './ResolutionError.js';
import { Response } from './Response.js';

/** Statuses that the Response constructor rejects a body for. */
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

/**
 * Links of a graph node with the optionality of `Graph['links']` removed, so that
 * indexing into it is known to produce a {@link Graph}.
 */
type Links<TGraph extends Graph> = NonNullable<TGraph['links']>;

/** Chain of curies leading to a hAPI resource starting with a base URL. */
type CurieChain = [URL, ...string[]];

/** Options of {@link APINode} constructor. */
type NodeInit = {
  /** Path to this resource node as base URL followed by a list of curies. */
  path: CurieChain;
  /** Custom Fetch API implementation for making authenticated requests. */
  fetch: typeof globalThis.fetch;
  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  cache: Storage;
  /** Shared {@link Logger} instance. */
  console: Logger;
};

/**
 * Serializes object zoom definition using hAPI format.
 *
 * @param prefix Curie prefix.
 * @param zoom Zoom definition as object.
 * @returns Serialized zoom parameter value.
 */
function stringifyZoom(prefix: string, zoom: unknown): string {
  const scope = prefix === '' ? '' : prefix + ':';

  if (typeof zoom === 'string') return scope + zoom;
  if (Array.isArray(zoom)) return zoom.map(v => stringifyZoom(prefix, v)).join();

  return Object.entries(zoom as Record<string, unknown>)
    .map(([key, value]) => stringifyZoom(scope + key, value))
    .join();
}

/**
 * Serializes object order definition using hAPI format.
 *
 * @param order Order definition as object.
 * @returns Serialized order parameter value.
 */
function stringifyOrder(order: unknown): string {
  if (typeof order === 'string') return order;

  if (Array.isArray(order)) {
    return order.map(item => stringifyOrder(item)).join();
  }

  return Object.entries(order as Record<string, unknown>)
    .map(([key, value]) => `${key} ${value}`)
    .join();
}

/**
 * Base class representing a resource node that can be fetched,
 * created, updated or deleted. You shouldn't need to create instances
 * of this class unless you're building a custom API client with our SDK.
 */
export class Node<TGraph extends Graph> {
  static readonly ResolutionError = ResolutionError;

  static readonly Response = Response;

  /** Shared {@link Logger} instance. */
  protected readonly _console: Logger;

  /** Custom Fetch API implementation for making authenticated requests. */
  protected readonly _fetch: typeof globalThis.fetch;

  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  protected readonly _cache: Storage;

  /** Path to this resource node as base URL followed by a list of curies. */
  protected readonly _path: CurieChain;

  constructor(init: NodeInit) {
    if (typeof init !== 'object' || init === null) throw new TypeError('init must be an object.');

    assertCurieChain(init.path);
    assertStorage(init.cache, 'init.cache');
    if (typeof init.fetch !== 'function') throw new TypeError('init.fetch must be a function.');
    if (typeof init.console !== 'object' || init.console === null) {
      throw new TypeError('init.console must be a logger.');
    }

    this._path = init.path;
    this._fetch = init.fetch;
    this._cache = init.cache;
    this._console = init.console;
  }

  async get(): Promise<Response<TGraph>>;

  async get<Q extends Query<TGraph>>(query: Q): Promise<Response<TGraph, Q>>;

  /**
   * Resolves the URL of this node and sends a GET request
   * using provided parameters.
   *
   * @param query Query parameters such as zoom, fields etc.
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async get(query?: Query<TGraph>): Promise<Response<TGraph>> {
    assertQuery(query);

    const url = await this._resolve();
    const { filters, fields, offset, limit, order, zoom } = query ?? {};

    if (filters !== undefined) {
      filters.forEach((filter: string) => {
        const [key, value = ''] = filter.split('=');
        if (key) url.searchParams.append(key, value);
      });
    }

    if (fields !== undefined) url.searchParams.set('fields', fields.join(','));
    if (offset !== undefined) url.searchParams.set('offset', String(offset));
    if (limit !== undefined) url.searchParams.set('limit', String(limit));
    if (order !== undefined) url.searchParams.set('order', stringifyOrder(order));
    if (zoom !== undefined) url.searchParams.set('zoom', stringifyZoom('', zoom));

    const response = await this._fetch(new Request(url.toString()));

    return this._toResponse(response);
  }

  /**
   * Resolves the URL of this node and sends a PUT request
   * with provided properties, replacing the existing resource.
   *
   * @param body Complete resource object.
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async put(body?: TGraph['props']): Promise<Response<TGraph>> {
    const url = await this._resolve();
    const request = new Request(url.toString(), { body: JSON.stringify(body), method: 'PUT' });
    const response = await this._fetch(request);

    return this._toResponse(response);
  }

  /**
   * Resolves the URL of this node and sends a POST request
   * with provided properties, creating a resource or triggering an action.
   *
   * @param body Complete resource object.
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async post(body?: TGraph['props']): Promise<Response<TGraph>> {
    const url = await this._resolve();
    const request = new Request(url.toString(), { body: JSON.stringify(body), method: 'POST' });
    const response = await this._fetch(request);

    return this._toResponse(response);
  }

  /**
   * Resolves the URL of this node and sends a PATCH request
   * with provided properties, updating this resource.
   *
   * @param body Partial resource object.
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async patch(body?: Partial<TGraph['props']>): Promise<Response<TGraph>> {
    const url = await this._resolve();
    const request = new Request(url.toString(), { body: JSON.stringify(body), method: 'PATCH' });
    const response = await this._fetch(request);

    return this._toResponse(response);
  }

  /**
   * Resolves the URL of this node and sends a DELETE request,
   * removing this resource.
   *
   * @returns Instance of {@link APIResponse} representing this resource.
   */
  async delete(): Promise<Response<TGraph>> {
    const url = await this._resolve();
    const request = new Request(url.toString(), { method: 'DELETE' });
    const response = await this._fetch(request);

    return this._toResponse(response);
  }

  /**
   * Resource path builder. Calling this method instructs our
   * SDK to find the provided curie in this resource's links and
   * navigate to its location on request.
   *
   * @param curie Curie to follow.
   * @returns Instance of {@link APINode} representing the resource at curie location.
   */
  follow<C extends keyof Links<TGraph>>(curie: C): Node<Links<TGraph>[C]> {
    assertCurie(curie);

    const config = { cache: this._cache, console: this._console, fetch: this._fetch };
    const path = this._path.concat(curie as string) as CurieChain;

    return new Node<Links<TGraph>[C]>({ ...config, path });
  }

  /**
   * Wraps a raw fetch response in this SDK's followable {@link Response}.
   *
   * Status, statusText and headers are copied explicitly. They cannot be
   * spread: on a native Response they are prototype getters rather than own
   * enumerable properties, so `{ ...response }` yields an empty object and
   * every response would silently become 200 OK with no headers.
   *
   * @param response Raw fetch response.
   * @returns Followable response.
   */
  protected async _toResponse(response: globalThis.Response): Promise<Response<TGraph>> {
    return new Response({
      body: NULL_BODY_STATUSES.has(response.status) ? null : await response.text(),
      cache: this._cache,
      console: this._console,
      fetch: this._fetch,
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  }

  /**
   * Resolves resource URL from a curie chain. The first element in the path
   * must be a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL).
   *
   * @returns Resolved URL.
   * @throws Throws {@link APIResolutionError} when once of the resources can't be reached.
   */
  protected async _resolve(): Promise<URL> {
    if (this._path.length === 1) return new URL(this._path[0].toString());

    const [baseURL, curie] = this._path;
    const key = `${baseURL.toString()} > ${curie}`;
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    this._console.trace(`Trying to resolve ${key}...`);
    const cachedURL = this._cache.getItem(key);

    if (cachedURL) {
      this._console.success(`Resolved ${key} to ${cachedURL.toString()} using cache.`);
      const reducedPath = [new URL(cachedURL), ...this._path.slice(2)] as CurieChain;
      return new Node({ ...config, path: reducedPath })._resolve();
    }

    const response = await this._fetch(baseURL.toString());

    if (response.ok) {
      const json = await response.clone().json();

      if (json._links[curie]) {
        const url = new URL(json._links[curie].href);
        const reducedPath = [url, ...this._path.slice(2)] as CurieChain;

        this._cache.setItem(key, url.toString());
        this._console.trace(`Cached ${url.toString()} for ${key}.`);
        this._console.success(`Resolved ${key} to ${url.toString()} online.`);

        return new Node({ ...config, path: reducedPath })._resolve();
      }
    }

    this._console.error(`Failed to resolve ${key}.`);
    throw new ResolutionError(response);
  }
}
