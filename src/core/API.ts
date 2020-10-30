import MemoryStorage from 'ministorage';
import { APINode, Graph } from './internal';
import consola, { Consola, LogLevel } from 'consola';
import { fetch } from 'cross-fetch';

/** Chain of curies leading to a hAPI resource starting with a base URL. */
export type APICurieChain = [URL, ...string[]];

/** API constructor parameters. */
export type APIInit = {
  /**
   * Credentials storage implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
   * Access tokens and other related info will be stored here. Defaults to in-memory storage.
   */
  storage?: Storage;

  /**
   * Numeric [Consola](https://github.com/nuxt-contrib/consola) log level.
   * If omitted, Consola defaults will be used.
   */
  level?: LogLevel;

  /**
   * Request handler implementing [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
   * This function will be called whenever a resource is requested. Defaults to native fetch or a custom implementation of Fetch API for Node.
   */
  fetch?: Window['fetch'];

  /**
   * Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
   * Every resolved path will be stored here for future use. Defaults to in-memory storage.
   */
  cache?: Storage;

  /**
   * Bookmark [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) for this API.
   * This is where the tree traversal begins. We also use this URL as a base for relative paths.
   */
  base: URL;
};

/**
 * Base API class for all custom clients in this SDK. If you're building
 * your own client, consider extending this class for consistency.
 */
export class API<G extends Graph> extends APINode<G> {
  /**
   * [Consola](https://github.com/nuxt-contrib/consola) instance.
   * If you extend this class and add logging in your code, use this instead of native console.
   */
  readonly console: Consola;

  /**
   * Credentials storage implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
   * Access tokens and other related info will be stored here. Clearing this storage will log you out.
   */
  readonly storage: Storage;

  /**
   * Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
   * Every resolved path will be stored here for future use. You can clear this cache by calling `clear()`.
   */
  readonly cache: Storage;

  /**
   * Bookmark [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) for this API.
   * This is where the tree traversal begins. We also use this URL as a base for relative paths.
   */
  readonly base: URL;

  constructor(init: APIInit) {
    super({
      cache: init.cache ?? new MemoryStorage(),
      console: consola.create({ level: init.level }).withTag('@foxy.io/sdk'),
      fetch: init.fetch ?? fetch,
      path: [init.base],
    });

    this.console = this._console;
    this.storage = init.storage ?? new MemoryStorage();
    this.cache = this._cache;
    this.base = init.base;
  }

  /**
   * Makes a raw and, if possible, authenticated request to the API.
   * This method implements native [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
   *
   * @param args Fetch API arguments (url and request parameters).
   * @returns Fetch API response.
   */
  async fetch(...args: Parameters<Window['fetch']>): ReturnType<Window['fetch']> {
    return this._fetch(...args);
  }
}
