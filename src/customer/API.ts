import type { Credentials, CustomerSession, SignUpParams, StoredSession } from './types';
import type { Graph } from './Graph';

import { assertBoolean, assertCredentials, assertEmail, assertSignUpParams, assertStoredSession } from '../core/guards.js';

import * as Core from '../core/index.js';

export type APIEventMap = {
  /**
   * The session changed: {@link API.signIn} started one, a request extended it, {@link API.usesTemporaryPassword}
   * changed it, or it ended (`null`) on {@link API.signOut} or when it expired. Save it to restore it later with
   * {@link API.setSession}.
   */
  session: CustomEvent<StoredSession | null>;
};

/**
 * Customer API for adding custom functionality to websites and web apps with our Customer Portal.
 *
 * **IMPORTANT**: this client is not compatible with the beta version of Customer API.
 * If you're still on beta, please consider updating your code to the latest stable version.
 * You can use @foxy.io/sdk prior to 1.0.0-beta.15 or a custom API client until you transition.
 */
export class API extends Core.API<Graph> {
  #session: StoredSession | null = null;

  // Private so that only this class can dispatch `session`.
  #events = new EventTarget();

  constructor(params: ConstructorParameters<typeof Core.API>[0]) {
    super({ ...params, fetch: (...args) => this.__fetch(...args) });
  }

  /**
   * Listens for API events. A listener that throws is reported as an uncaught
   * exception, so catch errors inside it. An async listener is not awaited.
   */
  addEventListener<K extends keyof APIEventMap>(
    type: K,
    listener: (event: APIEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.#events.addEventListener(type, listener as EventListener, options);
  }

  removeEventListener<K extends keyof APIEventMap>(
    type: K,
    listener: (event: APIEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void {
    this.#events.removeEventListener(type, listener as EventListener, options);
  }

  /** A copy of the current session, or `null` when there is none. */
  get session(): StoredSession | null {
    return this.#session && { ...this.#session };
  }

  /**
   * Replaces the session this instance uses, for example one saved from an
   * earlier `session` event. `null` forgets the session without a request.
   * Does not dispatch `session`.
   */
  setSession(session: StoredSession | null): void {
    if (session !== null) assertStoredSession(session);
    this.#session = session === null ? null : { ...session };
  }

  /**
   * Creates a Customer Portal session for a customer with the given credentials.
   * Incorrect email and password will trigger `AuthError` with code `UNAUTHORIZED`.
   *
   * @param credentials Customer email and password (one-time code).
   */
  async signIn(credentials: Credentials): Promise<void> {
    assertCredentials(credentials);

    const response = await this.fetch(new URL('./authenticate', this.base).toString(), {
      body: JSON.stringify(credentials),
      method: 'POST',
    });

    if (response.ok) {
      const session: CustomerSession = await response.json();
      this.#setSession({ ...session, date_created: new Date().toISOString() });
    } else {
      const code = response.status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN';
      throw new Core.API.AuthError({ code });
    }
  }

  /**
   * Creates a new customer account with the given credentials.
   * If the email is already taken, `AuthError` with code `UNAVAILABLE` will be thrown.
   * If customer registration is disabled, `AuthError` with code `UNAUTHORIZED` will be thrown.
   * If the provided form data is invalid (e.g. captcha is expired), `AuthError` with code `INVALID_FORM` will be thrown.
   *
   * @param params Customer information.
   */
  async signUp(params: SignUpParams): Promise<void> {
    assertSignUpParams(params);

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
    assertEmail(params.email);

    const response = await this.fetch(new URL('./forgot_password', this.base).toString(), {
      body: JSON.stringify(params),
      method: 'POST',
    });

    if (!response.ok) throw new Core.API.AuthError({ code: 'UNKNOWN' });
  }

  /** Ends the session on the server, then forgets it and dispatches `session` with `null`. */
  async signOut(): Promise<void> {
    const response = await this.fetch(new URL('./authenticate', this.base).toString(), { method: 'DELETE' });
    if (!response.ok) throw new Core.API.AuthError({ code: 'UNKNOWN' });

    this.#setSession(null);
  }

  /**
   * When logged in with a temporary password, this property getter will return `true`.
   * Will return `false` if password reset is not required or if the session has not been
   * initiated, or if the session was initiated before the introduction of this feature.
   *
   * @returns {boolean} Password reset requirement.
   */
  get usesTemporaryPassword(): boolean {
    return !!this.#session?.force_password_reset;
  }

  set usesTemporaryPassword(value: boolean) {
    assertBoolean(value, 'usesTemporaryPassword');
    if (this.#session) this.#setSession({ ...this.#session, force_password_reset: value });
  }

  /** Keeps the session in memory and dispatches `session` with a copy of it. */
  #setSession(session: StoredSession | null): void {
    this.#session = session;
    this.#events.dispatchEvent(new CustomEvent('session', { detail: session && { ...session } }));
  }

  private async __fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let session = this.#session;
    const request = new Request(input, init);

    if (session !== null) {
      const expiresAt = new Date(session.date_created).getTime() + session.expires_in * 1000;
      const now = Date.now();

      if (expiresAt < now) {
        this.console.info('Session has expired, signing out.');
        this.#setSession(null);
        session = null;
      } else {
        request.headers.set('Authorization', `Bearer ${session.session_token}`);
      }
    }

    request.headers.set('Content-Type', 'application/json');
    request.headers.set('FOXY-API-VERSION', '1');

    this.console.trace(`${request.method} ${request.url}`);
    const response = await globalThis.fetch(request);

    // Skip it when signOut() or setSession() replaced the session during the request.
    if (session && response.ok && this.#session === session) {
      this.#setSession({ ...session, date_created: new Date().toISOString() });
    }

    return response;
  }
}
