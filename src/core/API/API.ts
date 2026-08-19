import { assertCoreAPIInit } from '../guards.js';
import { createLogger } from '../logger.js';
import type { Logger } from '../logger.js';
import { MemoryStorage } from '../storage.js';

import { AuthError } from './AuthError.js';
import type { Graph } from '../Graph';
import { Node } from './Node.js';

/** API constructor parameters. */
type Init = {
  /**
   * Credentials storage implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
   * Access tokens and other related info will be stored here. Defaults to in-memory storage.
   */
  storage?: Storage;

  /**
   * Numeric log level; methods above this level are no-ops.
   * If omitted, the default level will be used.
   */
  level?: number;

  /**
   * Request handler implementing [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
   * This function will be called whenever a resource is requested. Defaults to native fetch or a custom implementation of Fetch API for Node.
   */
  fetch?: typeof globalThis.fetch;

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
export class API<TGraph extends Graph> extends Node<TGraph> {
  static readonly AuthError = AuthError;

  static readonly Node = Node;

  /**
   * Shared {@link Logger} instance.
   * If you extend this class and add logging in your code, use this instead of native console.
   */
  readonly console: Logger;

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

  constructor(init: Init) {
    assertCoreAPIInit(init);

    super({
      cache: init.cache ?? new MemoryStorage(),
      console: createLogger({ level: init.level, tag: '@foxy.io/sdk' }),
      fetch: init.fetch ?? ((...args) => globalThis.fetch(...args)),
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
  async fetch(...args: Parameters<typeof globalThis.fetch>): Promise<globalThis.Response> {
    return this._fetch(...args);
  }
}
