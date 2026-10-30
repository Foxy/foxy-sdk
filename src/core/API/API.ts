import { assertCoreAPIInit } from '../guards.js';
import { createLogger } from '../logger.js';
import type { Logger } from '../logger.js';

import { AuthError } from './AuthError.js';
import type { Graph } from '../Graph';
import { Node } from './Node.js';

/** API constructor parameters. */
export type APIInit = {
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

  /**
   * Shared {@link Logger} instance.
   * If you extend this class and add logging in your code, use this instead of native console.
   */
  readonly console: Logger;

  /**
   * Bookmark [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) for this API.
   * This is where the tree traversal begins. We also use this URL as a base for relative paths.
   */
  readonly base: URL;

  constructor(init: APIInit) {
    assertCoreAPIInit(init);

    super({
      console: createLogger({ level: init.level, tag: '@foxy.io/sdk' }),
      fetch: init.fetch ?? ((...args) => globalThis.fetch(...args)),
      path: [init.base],
    });

    this.console = this._console;
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
