import { APIResponseNode, Graph, Query, ResponseJSON } from './internal';
import { Consola } from 'consola';
import { Response } from 'cross-fetch';

/** Options of {@link APIResponse} constructor. */
export type APIResponseInit = {
  /** Custom Fetch API implementation for making authenticated requests. */
  fetch: Window['fetch'];
  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  cache: Storage;
  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  console: Consola;
  /** Original API [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object. */
  response: Response;
};

/**
 * Base class representing any response returned by API. Extends the native Response
 * object of Fetch API and has all the data of the original response in addition
 * to a few custom methods. You shouldn't need to construct instances of this
 * class directly unless you're building a custom API client with this SDK.
 */
export class APIResponse<G extends Graph, Q extends Query<G> | undefined = undefined> extends Response {
  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  protected readonly _console: Consola;

  /** Custom Fetch API implementation for making authenticated requests. */
  protected readonly _fetch: Window['fetch'];

  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  protected readonly _cache: Storage;

  constructor({ response, console, fetch, cache }: APIResponseInit) {
    super(response.body, response);

    this._console = console;
    this._fetch = fetch;
    this._cache = cache;
  }

  /**
   * Gets JSON data from the response body and constructs
   * a followable {@link APIResponseNode} instance with a number of shortcuts
   * for the most common actions. Use this property instead of {@link APIResponse#json}
   * if you plan to interact with the received resource.
   *
   * @returns Followable API response.
   */
  async node(): Promise<APIResponseNode<G, Q>> {
    const json = await super.json();
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };
    return new APIResponseNode({ json, ...config });
  }

  /**
   * Gets raw JSON data from the response body. Use this method
   * if you need to access the resource object as-is or for performing
   * read-only operations.
   *
   * @returns Unmodified API response.
   */
  async json(): Promise<ResponseJSON<G, Q>> {
    return super.json();
  }
}
