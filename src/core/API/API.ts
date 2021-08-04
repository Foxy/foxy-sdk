import { Headers, Request, Response, fetch } from 'cross-fetch';
import consola, { Consola, LogLevel } from 'consola';
import { storageV8N, v8n } from '../v8n.js';

import { AuthError } from './AuthError.js';
import type { CustomStorage } from './CustomStorage';
import type { Graph } from '../Graph';
import MemoryStorage from 'fake-storage';
import { Node } from './Node.js';

/** API constructor parameters. */
type Init = {
  /**
   * Credentials storage implementing CustomStorage based on [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
   * Access tokens and other related info will be stored here. Defaults to in-memory storage.
   */
  storage?: CustomStorage;

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
   * Resolver cache implementing CustomStorage based on [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
   * Every resolved path will be stored here for future use. Defaults to in-memory storage.
   */
  cache?: CustomStorage;

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
export class API<TGraph extends Graph> extends Node<TGraph> {
  /**
   * Polyfilled version of the built-in `Response` class. If you need to check the return value of `.fetch()`,
   * use this class instead of the built-in one to avoid [this issue](https://github.com/github/fetch/issues/860).
   */
  static readonly WHATWGResponse = Response;

  /**
   * Polyfilled version of the built-in `Request` class. If you need to pass an instance of `Request` to `.fetch()`,
   * use this class instead of the built-in one to avoid [this issue](https://github.com/github/fetch/issues/860).
   */
  static readonly WHATWGRequest = Request;

  /**
   * Polyfilled version of the built-in `Headers` class. If you need to pass an instance of `Headers` to `.fetch()`,
   * use this class instead of the built-in one to avoid [this issue](https://github.com/github/fetch/issues/860).
   */
  static readonly WHATWGHeaders = Headers;

  /**
   * Polyfilled version of the built-in `fetch` function. If you need to call fetch() with poyfilled request, response or headers,
   * use this function instead of the built-in one to avoid [this issue](https://github.com/github/fetch/issues/860).
   */
  static readonly whatwgFetch = fetch;

  static readonly AuthError = AuthError;

  static readonly Node = Node;

  static readonly v8n = {
    classConstructor: v8n().schema({
      base: v8n().instanceOf(URL),
      cache: v8n().optional(storageV8N),
      fetch: v8n().optional(v8n().typeOf('function')),
      level: v8n().optional(v8n().integer()),
      storage: v8n().optional(storageV8N),
    }),
  };

  /**
   * [Consola](https://github.com/nuxt-contrib/consola) instance.
   * If you extend this class and add logging in your code, use this instead of native console.
   */
  readonly console: Consola;

  /**
   * Credentials storage implementing CustomStorage based on [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
   * Access tokens and other related info will be stored here. Clearing this storage will log you out.
   */
  readonly storage: CustomStorage;

  /**
   * Resolver cache implementing CustomStorage based on [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
   * Every resolved path will be stored here for future use. You can clear this cache by calling `clear()`.
   */
  readonly cache: CustomStorage;

  /**
   * Bookmark [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) for this API.
   * This is where the tree traversal begins. We also use this URL as a base for relative paths.
   */
  readonly base: URL;

  constructor(init: Init) {
    API.v8n.classConstructor.check(init);

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
