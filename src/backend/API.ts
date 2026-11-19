import * as Core from '../core/index.js';

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
};

type GrantOpts = ({ code: string } | { refreshToken: string }) & {
  clientSecret: string;
  clientId: string;
  version?: BackendAPIVersion;
  base?: URL; // pathname ending with "/" !!!
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

    const response = await fetch(url, { body, headers, method: 'POST' });

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

  private __tokenRefreshPromise: Promise<StoredToken> | null;

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
  }

  private async __fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let request = new Request(input, init);
    let headers = request.headers;

    const fetchNewAccessToken = async (): Promise<StoredToken> => {
      if (this.__tokenRefreshPromise) {
        this.console.trace('Token refresh already in progress, waiting...');
        return this.__tokenRefreshPromise;
      }

      this.__tokenRefreshPromise = (async () => {
        try {
          this.console.trace('Fetching a new access token...');
          const rawToken = await API.getToken(this, true).catch(originalError => {
            this.console.error(originalError.message);
            throw new Core.API.AuthError({ code: 'UNAUTHORIZED', originalError });
          });

          const token = { ...rawToken, date_created: new Date().toISOString() };
          this.storage.setItem(API.ACCESS_TOKEN, JSON.stringify(token));
          this.console.info('Access token updated.');
          return token;
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

    // Without a token we would send an unauthenticated request, which can look like a success
    // (e.g. GET on the API root returns 200). So we throw instead, unless there is a usable fallback:
    // a stored token that hasn't expired yet, or an Authorization header set by the caller.
    const fetchTokenForRequest = (fallback: StoredToken | null) => {
      return fetchNewAccessToken().catch(err => {
        if (fallback || headers.get('Authorization')) return fallback;
        throw err;
      });
    };

    let token = JSON.parse(this.storage.getItem(API.ACCESS_TOKEN) ?? 'null') as StoredToken | null;

    if (token) {
      const expiresAt = new Date(token.date_created).getTime() + token.expires_in * 1000;
      const refreshAt = Date.now() + API.REFRESH_THRESHOLD;

      if (expiresAt < refreshAt) {
        const isUsable = expiresAt > Date.now();

        if (!isUsable) {
          this.storage.removeItem(API.ACCESS_TOKEN);
          this.console.info('Removed old access token from the storage.');
        }

        token = await fetchTokenForRequest(isUsable ? token : null);
      }
    } else {
      this.console.trace("Access token isn't present in the storage.");
      token = await fetchTokenForRequest(null);
    }

    setHeaders(token?.access_token);
    const method = init?.method?.toUpperCase() ?? 'GET';
    this.console.trace(`${method} ${request.url}`);
    let response = await fetch(request);

    if (response.status === 401) {
      const { error } = (await response.clone().json()) as { error: string };

      if (error === 'invalid_token') {
        this.console.info('Access token is invalid or expired.');

        this.storage.removeItem(API.ACCESS_TOKEN);
        this.console.info('Removed old access token from the storage.');

        // The request has already been sent, so return its 401 response if we can't get a new token.
        token = await fetchNewAccessToken().catch(() => null);

        if (token) {
          request = new Request(input, init);
          headers = request.headers;
          setHeaders(token.access_token);
          this.console.trace(`Retrying ${method} ${request.url}`);
          response = await fetch(request);
        }
      }
    }

    return response;
  }
}
