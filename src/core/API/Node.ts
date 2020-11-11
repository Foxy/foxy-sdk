import { storageV8N, v8n } from '../v8n';

import { Consola } from 'consola';
import { Graph } from '../Graph';
import { Query } from '../Query';
import { Request } from 'cross-fetch';
import { ResolutionError } from './ResolutionError';
import { Response } from './Response';

/** Chain of curies leading to a hAPI resource starting with a base URL. */
type CurieChain = [URL, ...string[]];

/** Options of {@link APINode} constructor. */
type NodeInit = {
  /** Path to this resource node as base URL followed by a list of curies. */
  path: CurieChain;
  /** Custom Fetch API implementation for making authenticated requests. */
  fetch: Window['fetch'];
  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  cache: Storage;
  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  console: Consola;
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
  static readonly v8n = {
    constructor: v8n().schema({
      cache: storageV8N,
      console: v8n().instanceOf(Consola),
      fetch: v8n().typeOf('function'),
      path: v8n().curieChain(),
    }),
    follow: v8n().string(),
    get: v8n().optional(
      v8n().schema({
        fields: v8n().optional(v8n().array().every.string()),
        filters: v8n().optional(v8n().array().every.string()),
        limit: v8n().optional(v8n().number()),
        offset: v8n().optional(v8n().number()),
        order: v8n().optional(v8n().passesAnyOf(v8n().string(), v8n().object(), v8n().array())),
        zoom: v8n().optional(v8n().passesAnyOf(v8n().string(), v8n().object(), v8n().array())),
      })
    ),
  };

  static readonly ResolutionError = ResolutionError;

  static readonly Response = Response;

  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  protected readonly _console: Consola;

  /** Custom Fetch API implementation for making authenticated requests. */
  protected readonly _fetch: Window['fetch'];

  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  protected readonly _cache: Storage;

  /** Path to this resource node as base URL followed by a list of curies. */
  protected readonly _path: CurieChain;

  constructor(init: NodeInit) {
    Node.v8n.constructor.check(init);

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
    Node.v8n.get.check(query);

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

    return new Response({ ...config, ...response, body: await response.text() });
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
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    return new Response({ ...config, ...response, body: await response.text() });
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
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    return new Response({ ...config, ...response, body: await response.text() });
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
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    return new Response({ ...config, ...response, body: await response.text() });
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
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };

    return new Response({ ...config, ...response, body: await response.text() });
  }

  /**
   * Resource path builder. Calling this method instructs our
   * SDK to find the provided curie in this resource's links and
   * navigate to its location on request.
   *
   * @param curie Curie to follow.
   * @returns Instance of {@link APINode} representing the resource at curie location.
   */
  follow<C extends keyof TGraph['links']>(curie: C): Node<TGraph['links'][C]> {
    Node.v8n.follow.check(curie);

    const config = { cache: this._cache, console: this._console, fetch: this._fetch };
    const path = this._path.concat(curie as string) as CurieChain;

    return new Node({ ...config, path });
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
      const json = await response.json();
      const url = new URL(json._links[curie].href);
      const reducedPath = [url, ...this._path.slice(2)] as CurieChain;

      this._cache.setItem(key, url.toString());
      this._console.trace(`Cached ${url.toString()} for ${key}.`);
      this._console.success(`Resolved ${key} to ${url.toString()} online.`);

      return new Node({ ...config, path: reducedPath })._resolve();
    } else {
      this._console.error(`Failed to resolve ${key}.`);
      throw new ResolutionError(response);
    }
  }
}
