import { fetch } from "cross-fetch";
import { BrowserAPI } from "./BrowserAPI";
import { BrowserAPICredentials } from "./types/auth";
import { Graph } from "./types/customer";

interface CustomerAPISession {
  /** The session lifetime as configured in Foxy (in seconds). */
  cookieMaxAge: number;
  /** Name of the auth cookie and the respective auth header. */
  cookieName: string;
  /** Value of the auth cookie and the respective auth header. */
  cookieValue: string;
  /** Optional JWT string using RS256 (public/private key) signing. */
  jwt?: string;
}

export class CustomerAPI extends BrowserAPI<Graph> {
  static readonly AUTH_EXPIRES = "fx.customer.expires";
  static readonly AUTH_HEADER = "fx.customer";
  static readonly AUTH_TOKEN = "fx.customer";
  static readonly AUTH_JWT = "fx.customer.jwt";

  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const token = this.storage.getItem(CustomerAPI.AUTH_TOKEN);
    const headers = new Headers(init?.headers);

    headers.set("Content-Type", "application/json");
    if (token !== null) headers.set(CustomerAPI.AUTH_HEADER, token);

    const response = await fetch(input, { ...init, headers });
    const freshToken = response.headers.get(CustomerAPI.AUTH_HEADER);
    if (freshToken !== null) this.storage.setItem(CustomerAPI.AUTH_TOKEN, freshToken);

    return response;
  }

  async signIn(credentials: BrowserAPICredentials): Promise<void> {
    const response = await fetch(new URL("authenticate", this.baseURL).toString(), {
      headers: new Headers({ "Content-Type": "application/json" }),
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.ok) {
      const { jwt, cookieValue, cookieMaxAge } = (await response.json()) as CustomerAPISession;
      const expires = new Date(Date.now() + cookieMaxAge * 1000).toISOString();

      this.storage.setItem(CustomerAPI.AUTH_EXPIRES, expires);
      this.storage.setItem(CustomerAPI.AUTH_TOKEN, cookieValue);
      if (jwt) this.storage.setItem(CustomerAPI.AUTH_JWT, jwt);
    } else {
      throw { code: "NotAuthorizedException" }; // TODO
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const response = await fetch(new URL("forgot_password", this.baseURL).toString(), {
      headers: new Headers({ "Content-Type": "application/json" }),
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (!response.ok) throw { code: "UnhandledException" }; // TODO
  }

  async signOut(): Promise<void> {
    this.storage.clear();
  }
}
