import * as Core from '../core/index.js';

import type { Credentials, Session } from './types';
import { Request, fetch } from 'cross-fetch';

import type { Graph } from './Graph';
import { v8n } from '../core/v8n.js';

/**
 * Customer API for adding custom functionality to websites and web apps with our Customer Portal.
 *
 * **IMPORTANT**: this client is not compatible with the beta version of Customer API.
 * If you're still on beta, please consider updating your code to the latest stable version.
 * You can use @foxy.io/sdk prior to 1.0.0-beta.15 or a custom API client until you transition.
 */
export class API extends Core.API<Graph> {
  /** Storage key for customer session token. */
  static readonly SESSION_TOKEN = 'customer';

  /** Storage key for max session lifetime value (ms, stored as string). */
  static readonly EXPIRY = 'customer.expiry';

  /** Storage key for JWT representing authenticated customer. */
  static readonly JWT = 'customer.jwt';

  /** Storage key for SSO URL. */
  static readonly SSO = 'customer.sso';

  /** Validators for the method arguments in this class (internal). */
  static readonly v8n = Object.assign({}, Core.API.v8n, {
    credentials: v8n().schema({
      email: v8n().string(),
      newPassword: v8n().optional(v8n().string()),
      password: v8n().string(),
    }),
    email: v8n().string(),
  });

  constructor(params: ConstructorParameters<typeof Core.API>[0]) {
    super({ ...params, fetch: (...args) => this.__fetch(...args) });
  }

  /**
   * Creates a Customer Portal session for a customer with the given credentials.
   * Incorrect email and password will trigger `Core.API.AuthError` with code `UNAUTHORIZED`.
   *
   * @param credentials Customer email and password (one-time code).
   */
  async signIn(credentials: Credentials): Promise<void> {
    API.v8n.credentials.check(credentials);

    const response = await this.fetch(new URL('./authenticate', this.base).toString(), {
      body: JSON.stringify(credentials),
      method: 'POST',
    });

    if (response.ok) {
      const session = (await response.json()) as Session;
      const expires = new Date(Date.now() + session.expires_in);

      this.storage.setItem(API.SESSION_TOKEN, session.session_token, { expires });
      this.storage.setItem(API.EXPIRY, String(session.expires_in), { expires });
      this.storage.setItem(API.JWT, session.jwt, { expires });

      if (session.sso) this.storage.setItem(API.SSO, session.sso, { expires });
    } else {
      const code = response.status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN';
      throw new Core.API.AuthError({ code });
    }
  }

  /**
   * Initiates password reset for a customer with the given email.
   * If such customer exists, they will receive an email from Foxy with further instructions.
   *
   * @param params Password reset parameters.
   * @param params.email Customer email.
   */
  async sendPasswordResetEmail(params: { email: string }): Promise<void> {
    API.v8n.email.check(params.email);

    const response = await this.fetch(new URL('./forgot_password', this.base).toString(), {
      body: JSON.stringify(params),
      method: 'POST',
    });

    if (!response.ok) throw new Core.API.AuthError({ code: 'UNKNOWN' });
  }

  /** Destroys current session and clears local session data. */
  async signOut(): Promise<void> {
    const response = await this.fetch(new URL('./authenticate', this.base).toString(), { method: 'DELETE' });
    if (!response.ok) throw new Core.API.AuthError({ code: 'UNKNOWN' });

    this.storage.clear();
    this.cache.clear();
  }

  private async __fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const token = this.storage.getItem(API.SESSION_TOKEN);
    const request = new Request(input, init);

    if (typeof token === 'string') request.headers.set('Authorization', `Bearer ${token}`);

    request.headers.set('Content-Type', 'application/json');
    request.headers.set('FOXY-API-VERSION', '1');

    this.console.trace(`${request.method} ${request.url}`);
    const response = await fetch(request);

    if (typeof token === 'string' && response.ok) {
      const expiryAsString = this.storage.getItem(API.EXPIRY);

      if (typeof expiryAsString === 'string') {
        const expires = new Date(Date.now() + parseInt(expiryAsString));
        const jwt = this.storage.getItem(API.JWT);
        const sso = this.storage.getItem(API.SSO);

        if (typeof token === 'string') this.storage.setItem(API.SESSION_TOKEN, token, { expires });
        if (typeof jwt === 'string') this.storage.setItem(API.JWT, jwt, { expires });
        if (typeof sso === 'string') this.storage.setItem(API.SSO, sso, { expires });

        this.storage.setItem(API.EXPIRY, expiryAsString, { expires });
      }
    }

    return response;
  }
}
