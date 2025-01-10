import type { Credentials, Session, SignUpParams, StoredSession } from './types';
import type { Graph } from './Graph';

import { Request, fetch } from 'cross-fetch';
import { v8n } from '../core/v8n.js';

import * as Core from '../core/index.js';

/**
 * Customer API for adding custom functionality to websites and web apps with our Customer Portal.
 *
 * **IMPORTANT**: this client is not compatible with the beta version of Customer API.
 * If you're still on beta, please consider updating your code to the latest stable version.
 * You can use @foxy.io/sdk prior to 1.0.0-beta.15 or a custom API client until you transition.
 */
export class API extends Core.API<Graph> {
  /** Storage key for session data. */
  static readonly SESSION = 'session';

  /** Validators for the method arguments in this class (internal). */
  static readonly v8n = Object.assign({}, Core.API.v8n, {
    signUpParams: v8n().schema({
      verification: v8n().schema({
        token: v8n().string(),
        type: v8n().passesAnyOf(v8n().exact('hcaptcha')),
      }),
      first_name: v8n().optional(v8n().string().maxLength(50)),
      last_name: v8n().optional(v8n().string().maxLength(50)),
      password: v8n().string().maxLength(50),
      email: v8n().string().maxLength(100),
    }),
    credentials: v8n().schema({
      email: v8n().string(),
      newPassword: v8n().optional(v8n().string()),
      password: v8n().string(),
    }),
    boolean: v8n().boolean(),
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
      const session: Session = await response.json();
      const storedSession: StoredSession = { ...session, date_created: new Date().toISOString() };
      this.storage.setItem(API.SESSION, JSON.stringify(storedSession));
    } else {
      const code = response.status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN';
      throw new Core.API.AuthError({ code });
    }
  }

  /**
   * Creates a new customer account with the given credentials.
   * If the email is already taken, `Core.API.AuthError` with code `UNAVAILABLE` will be thrown.
   * If customer registration is disabled, `Core.API.AuthError` with code `UNAUTHORIZED` will be thrown.
   * If the provided form data is invalid (e.g. captcha is expired), `Core.API.AuthError` with code `INVALID_FORM` will be thrown.
   *
   * @param params Customer information.
   */
  async signUp(params: SignUpParams): Promise<void> {
    API.v8n.signUpParams.check(params);

    const url = new URL('./sign_up', this.base);
    const response = await this.fetch(url.toString(), {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      if (response.status === 400) throw new Core.API.AuthError({ code: 'INVALID_FORM' });
      if (response.status === 401) throw new Core.API.AuthError({ code: 'UNAUTHORIZED' });
      if (response.status === 403) throw new Core.API.AuthError({ code: 'UNAVAILABLE' });
      throw new Core.API.AuthError({ code: 'UNKNOWN' });
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

  /**
   * When logged in with a temporary password, this property getter will return `true`.
   * Will return `false` if password reset is not required or if the session has not been
   * initiated, or if the session was initiated before the introduction of this feature.
   *
   * @returns {boolean} Password reset requirement.
   */
  get usesTemporaryPassword(): boolean {
    const session = this.storage.getItem(API.SESSION);
    if (session) return !!(JSON.parse(session) as StoredSession).force_password_reset;
    return false;
  }

  set usesTemporaryPassword(value: boolean) {
    API.v8n.boolean.check(value);
    const session = this.storage.getItem(API.SESSION);
    if (session) {
      const storedSession = JSON.parse(session) as StoredSession;
      storedSession.force_password_reset = value;
      this.storage.setItem(API.SESSION, JSON.stringify(storedSession));
    }
  }

  private async __fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let session = JSON.parse(this.storage.getItem(API.SESSION) ?? 'null') as StoredSession | null;
    const request = new Request(input, init);

    if (session !== null) {
      const expiresAt = new Date(session.date_created).getTime() + session.expires_in * 1000;
      const now = Date.now();

      if (expiresAt < now) {
        this.console.info('Session has expired, signing out.');
        this.storage.clear();
        this.cache.clear();
        session = null;
      } else {
        request.headers.set('Authorization', `Bearer ${session.session_token}`);
      }
    }

    request.headers.set('Content-Type', 'application/json');
    request.headers.set('FOXY-API-VERSION', '1');

    this.console.trace(`${request.method} ${request.url}`);
    const response = await fetch(request);

    if (session && response.ok) {
      const refreshedSession = { ...session, date_created: new Date().toISOString() };
      this.storage.setItem(API.SESSION, JSON.stringify(refreshedSession));
    }

    return response;
  }
}
