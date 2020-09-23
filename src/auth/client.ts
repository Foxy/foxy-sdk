import { Props } from "../types/api/props";
import MemoryStorage from "ministorage";
import { Auth } from "./types";

interface ClientCredentials {
  /**
   * OAuth2 client ID for your integration.
   * If omitted from the config, the value of the `FOXY_API_CLIENT_ID` env var will be used.
   *
   * @see https://api.foxycart.com/docs/authentication
   * @tutorial https://api.foxycart.com/docs/authentication/client_creation
   */
  clientId: string;

  /**
   * OAuth2 client secret for your integration.
   * If omitted from the config, the value of the `FOXY_API_CLIENT_SECRET` env var will be used.
   *
   * @see https://api.foxycart.com/docs/authentication
   * @tutorial https://api.foxycart.com/docs/authentication/client_creation
   */
  clientSecret: string;

  /**
   * OAuth2 long-term refresh token for your integration.
   * If omitted from the config, the value of the `FOXY_API_REFRESH_TOKEN` env var will be used.
   *
   * @see https://api.foxycart.com/docs/authentication
   * @tutorial https://api.foxycart.com/docs/authentication/client_creation
   */
  refreshToken: string;
}

interface ClientAuthParameters {
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
  endpoint?: string;
}

interface StoredToken {
  value: string;
  expiresAt: number;
}

export class ClientAuth implements Auth {
  static ENDPOINT = "https://api.foxycart.com";
  static ACCESS_TOKEN = "fx.client";

  private _storage: Storage;
  private _endpoint: string;
  private _clientId?: string;
  private _clientSecret?: string;
  private _refreshToken?: string;

  constructor(params?: ClientAuthParameters) {
    this._storage = params?.storage ?? new MemoryStorage();
    this._endpoint = params?.endpoint ?? ClientAuth.ENDPOINT;
  }

  get endpoint() {
    return this._endpoint;
  }

  get isSignedIn() {
    return this._clientId && this._clientSecret && this._refreshToken;
  }

  async fetch(input: string, init?: RequestInit) {
    if (!this.isSignedIn) {
      throw new Error("Please .signIn() before calling .fetch()");
    }

    let token = this._storage.getItem(ClientAuth.ACCESS_TOKEN) as string;
    if (!token || !this._validateToken(token)) token = await this._refreshAccessToken();

    const headers = {
      "FOXY-API-VERSION": "1",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    return await fetch(input, { ...init, headers: { ...init?.headers, ...headers } });
  }

  async signIn(credentials: ClientCredentials): Promise<void> {
    this._clientId = credentials.clientId;
    this._clientSecret = credentials.clientSecret;
    this._refreshToken = credentials.refreshToken;

    const token = this._storage.getItem(ClientAuth.ACCESS_TOKEN) as string;
    if (!token || !this._validateToken(token)) await this._refreshAccessToken();
  }

  async signOut(): Promise<void> {
    delete this._clientId;
    delete this._clientSecret;
    delete this._refreshToken;
    this._storage.removeItem(ClientAuth.ACCESS_TOKEN);
  }

  private _validateToken(token: string | undefined): token is string {
    if (token) {
      try {
        const parsedToken = JSON.parse(token) as StoredToken;
        return parsedToken.expiresAt > Date.now() / 1000 + 300;
      } catch {}
    }

    return false;
  }

  private async _refreshAccessToken() {
    if (!this._clientId || !this._clientSecret || !this._refreshToken) {
      throw new Error("Client ID, secret and refresh token are required to get access token.");
    }

    const response = await fetch(`${this._endpoint}/token`, {
      method: "POST",
      headers: {
        "FOXY-API-VERSION": "1",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this._refreshToken,
        client_secret: this._clientSecret,
        client_id: this._clientId,
      }),
    });

    const text = await response.text();

    if (response.ok) {
      const json = JSON.parse(text) as Props["fx:token"];
      const storedToken: StoredToken = {
        expiresAt: Date.now() + json.expires_in * 1000,
        value: json.access_token,
      };

      this._storage.setItem(ClientAuth.ACCESS_TOKEN, JSON.stringify(storedToken));
      return json.access_token;
    } else {
      throw new Error(text);
    }
  }
}
