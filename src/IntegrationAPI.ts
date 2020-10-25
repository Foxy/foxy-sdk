import fetch from "cross-fetch";
import MemoryStorage from "ministorage";
import { API } from "./API";
import { Graph } from "./types/integration";
import { Graph as FxToken } from "./types/integration/token";

type IntegrationAPIVersion = "1";

interface IntegrationAPIParameters {
  refreshToken: string;
  clientSecret: string;
  clientId: string;
  storage?: Storage;
  version?: IntegrationAPIVersion;
  baseURL?: URL; // pathname ending with "/" !!!
}

export class IntegrationAPI extends API<Graph> {
  static readonly REFRESH_THRESHOLD = 5 * 60 * 1000;
  static readonly ACCESS_TOKEN = "access_token";
  static readonly BASE_URL = new URL("https://api.foxycart.com/");
  static readonly VERSION = "1";

  readonly refreshToken: string;
  readonly clientSecret: string;
  readonly clientId: string;
  readonly version: IntegrationAPIVersion;

  constructor(params: IntegrationAPIParameters) {
    super({
      storage: params.storage ?? new MemoryStorage(),
      baseURL: params.baseURL ?? IntegrationAPI.BASE_URL,
      fetch: (...args) => this.fetch(...args),
    });

    this.refreshToken = params.refreshToken;
    this.clientSecret = params.clientSecret;
    this.clientId = params.clientId;
    this.version = params.version ?? IntegrationAPI.VERSION;
  }

  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let token = JSON.parse(this.storage.getItem(IntegrationAPI.ACCESS_TOKEN) ?? "null") as FxToken["props"] | null;

    if (token !== null) {
      const expiresAt = Date.now() + token.expires_in * 1000;
      if (expiresAt < Date.now() + IntegrationAPI.REFRESH_THRESHOLD) token = null;
    }

    if (token === null) {
      const headers = new Headers();
      const body = new URLSearchParams();
      const url = new URL("token", this.baseURL).toString();

      headers.set("FOXY-API-VERSION", this.version);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      body.set("refresh_token", this.refreshToken);
      body.set("client_secret", this.clientSecret);
      body.set("grant_type", "refresh_token");
      body.set("client_id", this.clientId);

      const response = await fetch(url, { method: "POST", headers, body });

      if (response.ok) {
        const text = await response.text();
        token = JSON.parse(text) as FxToken["props"];
        this.storage.setItem(IntegrationAPI.ACCESS_TOKEN, text);
      }
    }

    const headers = new Headers(init?.headers);

    headers.set("FOXY-API-VERSION", this.version);
    headers.set("Content-Type", "application/json");
    if (token !== null) headers.set("Authorization", `Bearer ${token}`);

    return fetch(input, { ...init, headers });
  }
}
