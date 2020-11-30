import * as Core from '../core';

import type { Credentials, Session } from './types';
import { Headers, fetch } from 'cross-fetch';

import type { Graph } from './Graph';

export class API extends Core.API<Graph> {
  static readonly AUTH_EXPIRES = 'fx.customer.expires';

  static readonly AUTH_HEADER = 'fx.customer';

  static readonly AUTH_TOKEN = 'fx.customer';

  static readonly AUTH_JWT = 'fx.customer.jwt';

  constructor(params: ConstructorParameters<typeof Core.API>[0]) {
    super({ ...params, fetch: (...args) => this.__fetch(...args) });
  }

  async signIn(credentials: Credentials): Promise<void> {
    let response: Response;

    try {
      response = await fetch(new URL('authenticate', this.base).toString(), {
        body: JSON.stringify(credentials),
        headers: new Headers({ 'Content-Type': 'application/json' }),
        method: 'POST',
      });
    } catch (err) {
      throw new Core.API.AuthError({
        code: 'UNKNOWN',
        originalError: err,
      });
    }

    if (response.ok) {
      const { jwt, cookieValue, cookieMaxAge } = (await response.json()) as Session;
      const expires = new Date(Date.now() + cookieMaxAge * 1000).toISOString();

      this.storage.setItem(API.AUTH_EXPIRES, expires);
      this.storage.setItem(API.AUTH_TOKEN, cookieValue);
      if (jwt) this.storage.setItem(API.AUTH_JWT, jwt);
    } else {
      throw new Core.API.AuthError({
        code: response.status.toString().startsWith('5') ? 'UNKNOWN' : 'UNAUTHORIZED',
      });
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    let response: Response;

    try {
      response = await fetch(new URL('forgot_password', this.base).toString(), {
        body: JSON.stringify({ email }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
        method: 'POST',
      });
    } catch (err) {
      throw new Core.API.AuthError({
        code: 'UNKNOWN',
        originalError: err,
      });
    }

    if (!response.ok) throw new Core.API.AuthError({ code: 'UNKNOWN' });
  }

  async signOut(): Promise<void> {
    this.storage.clear();
  }

  private async __fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    const method = init?.method?.toUpperCase() ?? 'GET';
    const token = this.storage.getItem(API.AUTH_TOKEN);
    const url = typeof input === 'string' ? input : input.url;

    headers.set('Content-Type', 'application/json');
    if (token !== null) headers.set(API.AUTH_HEADER, token);

    this.console.trace(`${method} ${url}`);
    const response = await fetch(url, { ...init, headers });
    const freshToken = response.headers.get(API.AUTH_HEADER);
    if (freshToken !== null) this.storage.setItem(API.AUTH_TOKEN, freshToken);

    return response;
  }
}
