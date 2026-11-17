import * as Core from '../core/index.js';

import { Fetch, sendWithCustomFetch } from '../core/transport/index.js';
import { Headers, Request, fetch } from 'cross-fetch';
import { checkArgument, storageV8N, v8n } from '../core/v8n.js';

import type { Graph } from './Graph';
import type { LogLevel } from 'consola';
import MemoryStorage from 'fake-storage';

/** In order to facilitate any major, unforeseen breaking changes in the future, we require each request to include API version. We hope to rarely (never?) change it but by requiring it up front, we can ensure what you get today is what you’ll get tomorrow. */
type BackendAPIVersion = '1';

/** Contructor parameters of the {@link BackendAPI} class. */
type BackendAPIInit = {
  refreshToken: string;
  clientSecret: string;
  clientId: string;
  level?: LogLevel;
  storage?: Storage;
  version?: BackendAPIVersion;
  base?: URL; // pathname ending with "/" !!!
  cache?: Storage;
  /**
   * Custom [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) implementation.
   * When provided, it's used for every request this client makes, including access token requests.
   * Defaults to `cross-fetch`.
   */
  fetch?: Fetch;
};

type GrantOpts = ({ code: string } | { refreshToken: string }) & {
  clientSecret: string;
  clientId: string;
  version?: BackendAPIVersion;
  base?: URL; // pathname ending with "/" !!!
  /** Custom Fetch API implementation for the token request. Defaults to `cross-fetch`. */
  fetch?: Fetch;
};

type Token = {
  refresh_token: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

type StoredToken = Token & { date_created: string };

/** JS SDK for building backends with [Foxy Hypermedia API](https://api.foxy.io/docs). Hypermedia API is designed to give you complete control over all aspects of your Foxy accounts, whether working with a single store or automating the provisioning of thousands. Anything you can do within the Foxy administration, you can also do through the API. This means that you can embed Foxy into any application (CMS, LMS, CRM, etc.) and expose as much or as little of Foxy's functionality as desired. */
export class API extends Core.API<Graph> {
  static readonly REFRESH_THRESHOLD = 5 * 60 * 1000;

  static readonly ACCESS_TOKEN = 'access_token';

  static readonly BASE_URL = new URL('https://api.foxy.io/');

  static readonly VERSION: BackendAPIVersion = '1';

  static readonly v8n = {
    classConstructor: v8n().schema({
      base: v8n().optional(v8n().instanceOf(URL)),
      cache: v8n().optional(storageV8N),
      clientId: v8n().string(),
      clientSecret: v8n().string(),
      fetch: v8n().optional(v8n().typeOf('function')),
      level: v8n().optional(v8n().integer()),
      refreshToken: v8n().string(),
      storage: v8n().optional(storageV8N),
      version: v8n().optional(v8n().passesAnyOf(v8n().exact('1'))),
    }),

    getAccessToken: v8n()
      .passesAnyOf(v8n().schema({ code: v8n().string() }), v8n().schema({ refreshToken: v8n().string() }))
      .schema({
        base: v8n().optional(v8n().instanceOf(URL)),
        clientId: v8n().string(),
        clientSecret: v8n().string(),
        fetch: v8n().optional(v8n().typeOf('function')),
        version: v8n().optional(v8n().passesAnyOf(v8n().exact('1'))),
      }),
  };

  /**
   * Fetches a new access token in exchange for an authorization code
   * or a refresh token. See more in our [authentication docs](https://api.foxy.io/docs/authentication).
   *
   * @param opts Request options.
   * @param throwOnFailure If true, this method will throw an error instead of returning null on failure to obtain a token.
   * @returns Access token with additional info on success, null on failure.
   */
  static async getToken(opts: GrantOpts): Promise<Token | null>;

  static async getToken(opts: GrantOpts, throwOnFailure: true): Promise<Token>;

  static async getToken(opts: GrantOpts, throwOnFailure = false): Promise<Token | null> {
    checkArgument(API.v8n.getAccessToken, opts, 'opts');

    const headers = new Headers();
    const body = new URLSearchParams();
    const url = new URL('token', opts.base ?? API.BASE_URL).toString();

    headers.set('FOXY-API-VERSION', opts.version ?? API.VERSION);
    headers.set('Content-Type', 'application/x-www-form-urlencoded');

    body.set('client_id', opts.clientId);
    body.set('client_secret', opts.clientSecret);

    if ('code' in opts) {
      body.set('code', opts.code);
      body.set('grant_type', 'authorization_code');
    } else {
      body.set('grant_type', 'refresh_token');
      body.set('refresh_token', opts.refreshToken);
    }

    const init = { body, headers, method: 'POST' };
    const response = opts.fetch
      ? await sendWithCustomFetch(opts.fetch, new Request(url, init))
      : await fetch(url, init);

    if (response.ok) return response.json();
    if (throwOnFailure) throw new Error(await response.text());
    return null;
  }

  /** OAuth refresh token. Non-enumerable, so it's left out of `console.log()`, `util.inspect()` and `JSON.stringify()` output. */
  readonly refreshToken!: string;

  /** OAuth client secret. Non-enumerable, so it's left out of `console.log()`, `util.inspect()` and `JSON.stringify()` output. */
  readonly clientSecret!: string;

  readonly clientId: string;

  readonly version: BackendAPIVersion;

  private __tokenRefreshPromise: Promise<StoredToken | null> | null;

  private readonly __customFetch?: Fetch;

  constructor(params: BackendAPIInit) {
    checkArgument(API.v8n.classConstructor, params, 'params');

    super({
      base: params.base ?? API.BASE_URL,
      cache: params.cache ?? new MemoryStorage(),
      fetch: (...args) => this.__fetch(...args),
      level: params.level,
      storage: params.storage ?? new MemoryStorage(),
    });

    // Non-enumerable so that logging or serializing the instance doesn't print the secrets.
    Object.defineProperties(this, {
      clientSecret: { configurable: true, enumerable: false, value: params.clientSecret, writable: true },
      refreshToken: { configurable: true, enumerable: false, value: params.refreshToken, writable: true },
    });

    this.clientId = params.clientId;
    this.version = params.version ?? API.VERSION;

    this.__tokenRefreshPromise = null;
    this.__customFetch = params.fetch;
  }

  private async __fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let request = new Request(input, init);
    let headers = request.headers;

    const fetchNewAccessToken = async (): Promise<StoredToken | null> => {
      if (this.__tokenRefreshPromise) {
        this.console.trace('Token refresh already in progress, waiting...');
        return this.__tokenRefreshPromise;
      }

      this.__tokenRefreshPromise = (async () => {
        try {
          this.console.trace('Fetching a new access token...');
          const grantOpts: GrantOpts = {
            base: this.base,
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            fetch: this.__customFetch,
            refreshToken: this.refreshToken,
            version: this.version,
          };

          const rawToken = await API.getToken(grantOpts, true).catch(err => {
            this.console.error(err.message);
            return null;
          });

          if (rawToken) {
            const token = { ...rawToken, date_created: new Date().toISOString() };
            this.storage.setItem(API.ACCESS_TOKEN, JSON.stringify(token));
            this.console.info('Access token updated.');
            return token;
          } else {
            this.console.warn('Failed to fetch access token. Proceeding without authentication.');
            return null;
          }
        } finally {
          this.__tokenRefreshPromise = null;
        }
      })();

      return this.__tokenRefreshPromise;
    };

    const setHeaders = (accessToken?: string) => {
      if (!headers.get('Authorization') && accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
      if (!headers.get('Content-Type')) headers.set('Content-Type', 'application/json');
      if (!headers.get('FOXY-API-VERSION')) headers.set('FOXY-API-VERSION', this.version);
    };

    let token = JSON.parse(this.storage.getItem(API.ACCESS_TOKEN) ?? 'null') as StoredToken | null;

    if (token) {
      const expiresAt = new Date(token.date_created).getTime() + token.expires_in * 1000;
      const refreshAt = Date.now() + API.REFRESH_THRESHOLD;

      if (expiresAt < refreshAt) {
        this.storage.removeItem(API.ACCESS_TOKEN);
        this.console.info('Removed old access token from the storage.');
        token = await fetchNewAccessToken();
      }
    } else {
      this.console.trace("Access token isn't present in the storage.");
      token = await fetchNewAccessToken();
    }

    setHeaders(token?.access_token);
    const method = init?.method?.toUpperCase() ?? 'GET';
    this.console.trace(`${method} ${request.url}`);
    let response = await this.__send(request, init);

    if (response.status === 401) {
      const { error } = (await response.clone().json()) as { error: string };

      if (error === 'invalid_token') {
        this.console.info('Access token is invalid or expired.');

        this.storage.removeItem(API.ACCESS_TOKEN);
        this.console.info('Removed old access token from the storage.');

        token = await fetchNewAccessToken();

        if (token) {
          request = new Request(input, init);
          headers = request.headers;
          setHeaders(token.access_token);
          this.console.trace(`Retrying ${method} ${request.url}`);
          response = await this.__send(request, init);
        }
      }
    }

    return response;
  }

  private __send(request: Request, init?: RequestInit): Promise<Response> {
    if (this.__customFetch) return sendWithCustomFetch(this.__customFetch, request, init);
    return fetch(request);
  }
}
