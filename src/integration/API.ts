import * as Core from '../core';
import * as Rels from './Rels';

import fetch, { Headers } from 'cross-fetch';

import { Graph } from './Graph';
import { LogLevel } from 'consola';
import MemoryStorage from 'fake-storage';

type LocalToken = Rels.FxToken['props'] & { date_created: string };

/** In order to facilitate any major, unforeseen breaking changes in the future, we require each request to include API version. We hope to rarely (never?) change it but by requiring it up front, we can ensure what you get today is what you’ll get tomorrow. */
type IntegrationAPIVersion = '1';

/** Contructor parameters of the {@link IntegrationAPI} class. */
type IntegrationAPIInit = {
  refreshToken: string;
  clientSecret: string;
  clientId: string;
  level?: LogLevel;
  storage?: Storage;
  version?: IntegrationAPIVersion;
  base?: URL; // pathname ending with "/" !!!
  cache?: Storage;
};

/** JS SDK for building integrations with [Foxy Hypermedia API](https://api.foxycart.com/docs). Hypermedia API is designed to give you complete control over all aspects of your Foxy accounts, whether working with a single store or automating the provisioning of thousands. Anything you can do within the Foxy administration, you can also do through the API. This means that you can embed Foxy into any application (CMS, LMS, CRM, etc.) and expose as much or as little of Foxy's functionality as desired. */
export class API extends Core.API<Graph> {
  static readonly REFRESH_THRESHOLD = 5 * 60 * 1000;

  static readonly ACCESS_TOKEN = 'access_token';

  static readonly BASE_URL = new URL('https://api.foxycart.com/');

  static readonly VERSION: IntegrationAPIVersion = '1';

  readonly refreshToken: string;

  readonly clientSecret: string;

  readonly clientId: string;

  readonly version: IntegrationAPIVersion;

  constructor(params: IntegrationAPIInit) {
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
    let token = JSON.parse(this.storage.getItem(API.ACCESS_TOKEN) ?? 'null') as LocalToken | null;

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
      const headers = new Headers();
      const body = new URLSearchParams();
      const url = new URL('token', this.base).toString();

      headers.set('FOXY-API-VERSION', this.version);
      headers.set('Content-Type', 'application/x-www-form-urlencoded');

      body.set('refresh_token', this.refreshToken);
      body.set('client_secret', this.clientSecret);
      body.set('grant_type', 'refresh_token');
      body.set('client_id', this.clientId);

      this.console.trace("Access token isn't present in the storage. Fetching a new one...");
      const response = await fetch(url, { body, headers, method: 'POST' });

      if (response.ok) {
        const props = (await response.json()) as Rels.FxToken['props'];
        token = { ...props, date_created: new Date().toISOString() };
        this.storage.setItem(API.ACCESS_TOKEN, JSON.stringify(token));
        this.console.info('Access token updated.');
      } else {
        this.console.warn('Failed to fetch access token. Proceeding without authentication.');
      }
    }

    const headers = new Headers(init?.headers);
    const method = init?.method?.toUpperCase() ?? 'GET';
    const url = typeof input === 'string' ? input : input.url;

    headers.set('FOXY-API-VERSION', this.version);
    headers.set('Content-Type', 'application/json');

    if (token !== null) headers.set('Authorization', `Bearer ${token.access_token}`);

    this.console.trace(`${method} ${url}`);
    return fetch(input, { ...init, headers });
  }
}
