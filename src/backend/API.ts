import * as Core from '../core/index.js';

import { Headers, Request, fetch } from 'cross-fetch';
import { storageV8N, v8n } from '../core/v8n.js';

import type { CustomStorage } from '../../src/core/API/CustomStorage';
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
  storage?: CustomStorage;
  version?: BackendAPIVersion;
  base?: URL; // pathname ending with "/" !!!
  cache?: CustomStorage;
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
    API.v8n.getAccessToken.check(opts);

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

  readonly refreshToken: string;

  readonly clientSecret: string;

  readonly clientId: string;

  readonly version: BackendAPIVersion;

  constructor(params: BackendAPIInit) {
    API.v8n.classConstructor.check(params);

    super({
      base: params.base ?? API.BASE_URL,
      cache: params.cache ?? new MemoryStorage(),
      fetch: (...args) => this.__fetch(...args),
      level: params.level,
      storage: params.storage ?? new MemoryStorage(),
    });

    this.refreshToken = params.refreshToken;
    this.clientSecret = params.clientSecret;
    this.clientId = params.clientId;
    this.version = params.version ?? API.VERSION;
  }

  private async __fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let token = JSON.parse(this.storage.getItem(API.ACCESS_TOKEN) ?? 'null') as StoredToken | null;
    const request = new Request(input, init);

    if (token !== null) {
      const expiresAt = new Date(token.date_created).getTime() + token.expires_in * 1000;
      const refreshAt = Date.now() + API.REFRESH_THRESHOLD;

      if (expiresAt < refreshAt) {
        this.storage.removeItem(API.ACCESS_TOKEN);
        this.console.info('Removed old access token from the storage.');
        token = null;
      }
    }

    if (token === null) {
      this.console.trace("Access token isn't present in the storage. Fetching a new one...");

      const rawToken = await API.getToken(this, true).catch(err => {
        this.console.error(err.message);
        return null;
      });

      if (rawToken) {
        token = { ...rawToken, date_created: new Date().toISOString() };
        this.storage.setItem(API.ACCESS_TOKEN, JSON.stringify(token));
        this.console.info('Access token updated.');
      } else {
        this.console.warn('Failed to fetch access token. Proceeding without authentication.');
      }
    }

    const headers = request.headers;
    const method = init?.method?.toUpperCase() ?? 'GET';

    if (!headers.get('Authorization') && token) headers.set('Authorization', `Bearer ${token.access_token}`);
    if (!headers.get('Content-Type')) headers.set('Content-Type', 'application/json');
    if (!headers.get('FOXY-API-VERSION')) headers.set('FOXY-API-VERSION', this.version);

    this.console.trace(`${method} ${request.url}`);
    return fetch(request);
  }
}
