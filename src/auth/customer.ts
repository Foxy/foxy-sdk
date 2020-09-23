import MemoryStorage from "ministorage";
import { Auth } from "./types";

interface CustomerAuthParameters {
  /**
   * Storage provider to store access token and other temporary values with.
   * In-memory session storage is used by default.
   */
  storage?: Storage;

  /**
   * Allows changing the API endpoint. You'll most likely never need to use this option.
   * A value of the `FOXY_API_URL` env var will be used if found.
   * Default value is `https://api.foxycart.com`.
   */
  endpoint: string;
}

interface CustomerCredentials {
  /**
   * Customer's email.
   */
  email: string;

  /**
   * Customer's current password or one-time code
   * generated with the help of the password reset feature.
   */
  password: string;
}

interface CustomerSignInResponse {
  /** The session lifetime as configured in Foxy (in seconds). */
  cookieMaxAge: number;

  /** Name of the auth cookie and the respective auth header. */
  cookieName: string;

  /** Value of the auth cookie and the respective auth header. */
  cookieValue: string;

  /** Optional JWT string using RS256 (public/private key) signing. */
  jwt?: string;
}

export class CustomerAuth implements Auth {
  static ACCESS_TOKEN = "fx.customer";
  static ACCESS_TOKEN_JWT = "fx.customer.jwt";
  static ACCESS_TOKEN_EXPIRES = "fx.customer.expires";

  private _storage: Storage;
  private _endpoint: string;

  get isSignedIn() {
    const token = this._storage.getItem(CustomerAuth.ACCESS_TOKEN);
    const expires = this._storage.getItem(CustomerAuth.ACCESS_TOKEN_EXPIRES);

    return token && expires && new Date(expires).getTime() > Date.now();
  }

  get endpoint() {
    return this._endpoint;
  }

  constructor(params: CustomerAuthParameters) {
    const url = new URL(params.endpoint);
    url.pathname = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;

    this._storage = params.storage ?? new MemoryStorage();
    this._endpoint = url.toString();
  }

  async fetch(input: string, init?: RequestInit) {
    const headers = {
      "Content-Type": "application/json",
      "fx.customer": this._storage.getItem(CustomerAuth.ACCESS_TOKEN) as string,
    };

    return await fetch(input, { ...init, headers: { ...init?.headers, ...headers } });
  }

  async signIn(credentials: CustomerCredentials): Promise<void> {
    const url = new URL(this._endpoint);
    url.pathname += "authenticate";

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (response.ok) {
      const { jwt, cookieValue, cookieMaxAge } = (await response.json()) as CustomerSignInResponse;
      const expires = new Date(Date.now() + cookieMaxAge * 1000).toISOString();

      if (jwt) this._storage.setItem(CustomerAuth.ACCESS_TOKEN_JWT, jwt);

      this._storage.setItem(CustomerAuth.ACCESS_TOKEN, cookieValue);
      this._storage.setItem(CustomerAuth.ACCESS_TOKEN_EXPIRES, expires);
    } else {
      throw { code: "NotAuthorizedException" };
    }
  }

  async signOut(): Promise<void> {
    this._storage.removeItem(CustomerAuth.ACCESS_TOKEN);
    this._storage.removeItem(CustomerAuth.ACCESS_TOKEN_JWT);
    this._storage.removeItem(CustomerAuth.ACCESS_TOKEN_EXPIRES);
  }
}
