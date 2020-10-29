import { APINodeInit, APIResponseNode, Graph, Query, ResponseJSON } from './index';
import { Consola } from 'consola';
import { Response } from 'cross-fetch';

export type APIResponseInit = Omit<APINodeInit, 'path'> & { response: Response };

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

  async node(): Promise<APIResponseNode<G, Q>> {
    const json = await super.json();
    const config = { cache: this._cache, console: this._console, fetch: this._fetch };
    return new APIResponseNode({ json, ...config });
  }

  json(): Promise<ResponseJSON<G, Q>> {
    return super.json();
  }
}
