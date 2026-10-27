import * as Core from '../core/index.js';
import {
  assertAdminAPIInit,
  assertAdminConfirmSignInArgs,
  assertAdminGetTokenOpts,
  assertAdminSignInParams,
  assertAdminTokens,
} from '../core/guards.js';

import type { Graph } from './Graph';

/** In order to facilitate any major, unforeseen breaking changes in the future, we require each request to include API version. We hope to rarely (never?) change it but by requiring it up front, we can ensure what you get today is what you'll get tomorrow. */
type AdminAPIVersion = '1';

/** Constructor parameters of the {@link API} class. */
export type APIInit = {
  clientSecret: string;
  clientId: string;
  /** Redirect URI registered for this OAuth client. Required for {@link API.signIn} and {@link API.confirmSignIn}. */
  redirectUri?: string;
  /** OAuth authorization endpoint. Defaults to {@link API.AUTHORIZATION_URL}. */
  authorizationUrl?: URL;
  level?: number;
  version?: AdminAPIVersion;
  base?: URL; // pathname ending with "/" !!!
  cache?: Storage;
};

export type GrantOpts = ({ code: string; redirectUri: string } | { refreshToken: string }) & {
  clientSecret: string;
  clientId: string;
  version?: AdminAPIVersion;
  base?: URL; // pathname ending with "/" !!!
};

export type TokenResponse = {
  refresh_token?: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

/** OAuth tokens held by an {@link API} instance. Plain JSON, so it can be saved as is and passed back to {@link API.setTokens}. */
export type Tokens = {
  accessToken?: string;
  refreshToken?: string;
  /** When the access token expires, in milliseconds since the Unix epoch. */
  expiresAt?: number;
  scope?: string;
};

/** Parameters of {@link API.signIn}. */
export type SignInParams = {
  /** Opaque value to keep in the user's session and pass to {@link API.confirmSignIn}. Protects the callback from login CSRF. */
  state: string;
  /** Space-separated OAuth scopes. Foxy denies a request without any. */
  scope: string;
  prompt?: string;
};

export type APIEventMap = {
  /** New tokens were obtained by {@link API.confirmSignIn} or by a token refresh. */
  tokens: CustomEvent<Tokens>;
};

/** JS SDK for building admin integrations with [Foxy Hypermedia API](https://api.foxy.io/docs). Hypermedia API is designed to give you complete control over all aspects of your Foxy accounts, whether working with a single store or automating the provisioning of thousands. Anything you can do within the Foxy administration, you can also do through the API. This means that you can embed Foxy into any application (CMS, LMS, CRM, etc.) and expose as much or as little of Foxy's functionality as desired. */
export class API extends Core.API<Graph> {
  static readonly REFRESH_THRESHOLD = 5 * 60 * 1000;

  static readonly BASE_URL = new URL('https://api.foxy.io/');

  static readonly AUTHORIZATION_URL = new URL('https://auth.foxy.io/authorize');

  static readonly VERSION: AdminAPIVersion = '1';

  /**
   * Fetches a new access token in exchange for an authorization code
   * or a refresh token. See more in our [authentication docs](https://api.foxy.io/docs/authentication).
   *
   * @param opts Request options.
   * @param throwOnFailure If true, this method will throw an error instead of returning null on failure to obtain a token.
   * @returns Access token with additional info on success, null on failure.
   */
  static async getToken(opts: GrantOpts): Promise<TokenResponse | null>;

  static async getToken(opts: GrantOpts, throwOnFailure: true): Promise<TokenResponse>;

  static async getToken(opts: GrantOpts, throwOnFailure = false): Promise<TokenResponse | null> {
    assertAdminGetTokenOpts(opts);

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
      body.set('redirect_uri', opts.redirectUri);
    } else {
      body.set('grant_type', 'refresh_token');
      body.set('refresh_token', opts.refreshToken);
    }

    const response = await globalThis.fetch(url, { body, headers, method: 'POST' });

    if (response.ok) return response.json();
    if (throwOnFailure) throw new Error(await response.text());
    return null;
  }

  readonly version: AdminAPIVersion;

  #clientSecret: string;

  #clientId: string;

  #redirectUri: string | undefined;

  #authorizationUrl: URL;

  #tokens: Tokens = {};

  #tokenRefreshPromise: Promise<Tokens> | null = null;

  // Private so that only this class can dispatch `tokens`.
  #events = new EventTarget();

  constructor(params: APIInit) {
    assertAdminAPIInit(params);

    super({
      base: params.base ?? API.BASE_URL,
      cache: params.cache,
      fetch: (...args) => this.#fetch(...args),
      level: params.level,
    });

    this.#clientSecret = params.clientSecret;
    this.#clientId = params.clientId;
    this.#redirectUri = params.redirectUri;
    this.#authorizationUrl = params.authorizationUrl ?? API.AUTHORIZATION_URL;
    this.version = params.version ?? API.VERSION;
  }

  /**
   * Listens for API events. A listener that throws is reported as an uncaught
   * exception, which ends a Node process by default, so catch errors inside it.
   * An async listener is not awaited.
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

  /**
   * Replaces the tokens this instance uses, for example ones saved from an
   * earlier `tokens` event. Does not dispatch `tokens`.
   */
  setTokens(tokens: Tokens): void {
    assertAdminTokens(tokens);
    this.#tokens = { ...tokens };
  }

  /**
   * Builds the URL to send the user to for the OAuth authorization code grant.
   * Foxy redirects back to `redirectUri` with a code; pass that URL to {@link API.confirmSignIn}.
   *
   * @param params Sign-in parameters.
   * @returns Authorization URL.
   */
  signIn(params: SignInParams): string {
    assertAdminSignInParams(params);
    const redirectUri = this.#requireRedirectUri();
    const url = new URL(this.#authorizationUrl);

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.#clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', params.state);
    url.searchParams.set('scope', params.scope);
    if (params.prompt !== undefined) url.searchParams.set('prompt', params.prompt);

    return url.toString();
  }

  /**
   * Completes the sign-in started by {@link API.signIn}: checks the state,
   * exchanges the code for tokens, keeps them and dispatches `tokens`.
   *
   * @param callbackUrl URL Foxy redirected the user to.
   * @param expectedState The `state` passed to {@link API.signIn} for this user.
   * @returns New tokens.
   * @throws AuthError with code `UNAUTHORIZED` when the state doesn't match, the user denied access, or the exchange failed.
   */
  async confirmSignIn(callbackUrl: string | URL, expectedState: string): Promise<Tokens> {
    assertAdminConfirmSignInArgs(callbackUrl, expectedState);
    const redirectUri = this.#requireRedirectUri();
    const { searchParams } = new URL(callbackUrl);
    const state = searchParams.get('state');
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Checked before anything else: a code this user didn't ask for must never be redeemed.
    if (!expectedState || state !== expectedState) {
      const originalError = new Error('state does not match');
      throw new Core.API.AuthError({ code: 'UNAUTHORIZED', originalError });
    }

    if (error || !code) {
      const reason = error ? `authorization failed: ${error}` : 'code is missing';
      throw new Core.API.AuthError({ code: 'UNAUTHORIZED', originalError: new Error(reason) });
    }

    const rawToken = await API.getToken(
      {
        base: this.base,
        clientId: this.#clientId,
        clientSecret: this.#clientSecret,
        code,
        redirectUri,
        version: this.version,
      },
      true,
    ).catch(err => {
      throw new Core.API.AuthError({ code: 'UNAUTHORIZED', originalError: err });
    });

    this.#tokens = this.#toTokens(rawToken, {});
    this.#dispatchTokens();
    return { ...this.#tokens };
  }

  #requireRedirectUri(): string {
    if (this.#redirectUri === undefined) throw new TypeError('init.redirectUri must be set to sign in.');
    return this.#redirectUri;
  }

  #toTokens(rawToken: TokenResponse, previous: Tokens): Tokens {
    return {
      accessToken: rawToken.access_token,
      refreshToken: rawToken.refresh_token ?? previous.refreshToken,
      expiresAt: Date.now() + rawToken.expires_in * 1000,
      scope: rawToken.scope,
    };
  }

  #dispatchTokens(): void {
    this.#events.dispatchEvent(new CustomEvent('tokens', { detail: { ...this.#tokens } }));
  }

  async #refreshTokens(): Promise<Tokens> {
    if (this.#tokenRefreshPromise) {
      this.console.trace('Token refresh already in progress, waiting...');
      return this.#tokenRefreshPromise;
    }

    const previous = this.#tokens;
    const refreshToken = previous.refreshToken;

    if (!refreshToken) {
      const originalError = new Error('no usable access or refresh token');
      throw new Core.API.AuthError({ code: 'UNAUTHORIZED', originalError });
    }

    this.#tokenRefreshPromise = (async () => {
      try {
        this.console.trace('Fetching a new access token...');

        const rawToken = await API.getToken(
          {
            base: this.base,
            clientId: this.#clientId,
            clientSecret: this.#clientSecret,
            refreshToken,
            version: this.version,
          },
          true,
        ).catch(err => {
          throw new Core.API.AuthError({ code: 'TOKEN_REFRESH_FAILED', originalError: err });
        });

        const tokens = this.#toTokens(rawToken, previous);

        // setTokens() ran during the refresh, so these tokens belong to the old session.
        if (this.#tokens !== previous) return tokens;

        this.#tokens = tokens;
        this.console.info('Access token updated.');
        this.#dispatchTokens();
        return tokens;
      } finally {
        this.#tokenRefreshPromise = null;
      }
    })();

    return this.#tokenRefreshPromise;
  }

  async #fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let request = new Request(input, init);
    let headers = request.headers;
    const method = request.method;

    if (!headers.get('Content-Type')) headers.set('Content-Type', 'application/json');
    if (!headers.get('FOXY-API-VERSION')) headers.set('FOXY-API-VERSION', this.version);

    if (headers.get('Authorization')) {
      this.console.trace(`${method} ${request.url}`);
      return globalThis.fetch(request);
    }

    const retryableRequest = request.clone();
    const { accessToken, expiresAt, refreshToken } = this.#tokens;
    const expiresSoon = expiresAt !== undefined && expiresAt < Date.now() + API.REFRESH_THRESHOLD;
    let token = accessToken;

    if (!accessToken || (expiresSoon && refreshToken)) {
      this.console.trace('Access token is missing or about to expire.');
      token = (await this.#refreshTokens()).accessToken;
    }

    headers.set('Authorization', `Bearer ${token}`);
    this.console.trace(`${method} ${request.url}`);
    let response = await globalThis.fetch(request);

    if (response.status === 401) {
      const { error } = (await response.clone().json()) as { error: string };

      if (error === 'invalid_token') {
        this.console.info('Access token is invalid or expired.');
        token = (await this.#refreshTokens()).accessToken;

        request = retryableRequest;
        headers = request.headers;
        headers.set('Authorization', `Bearer ${token}`);
        this.console.trace(`Retrying ${method} ${request.url}`);
        response = await globalThis.fetch(request);
      }
    }

    return response;
  }
}
