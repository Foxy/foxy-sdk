import { LogLevel } from "consola";
import fetch, { Headers } from "cross-fetch";
import MemoryStorage from "ministorage";
import { API } from "./core";
import { IntegrationAPIGraph } from "./rels/integration";
import { FxToken } from "./rels/integration/token";

type IntegrationAPIVersion = "1";
type IntegrationAPIToken = FxToken["props"] & { date_created: string };

interface IntegrationAPIParameters {
  refreshToken: string;
  clientSecret: string;
  clientId: string;
  logLevel?: LogLevel;
  storage?: Storage;
  version?: IntegrationAPIVersion;
  baseURL?: URL; // pathname ending with "/" !!!
  cache?: Storage;
}

export class IntegrationAPI extends API<IntegrationAPIGraph> {
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
      logLevel: params.logLevel,
      storage: params.storage ?? new MemoryStorage(),
      baseURL: params.baseURL ?? IntegrationAPI.BASE_URL,
      fetch: (...args) => this.fetch(...args),
      cache: params.cache ?? new MemoryStorage(),
    });

    this.refreshToken = params.refreshToken;
    this.clientSecret = params.clientSecret;
    this.clientId = params.clientId;
    this.version = params.version ?? IntegrationAPI.VERSION;
  }

  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let token = JSON.parse(this.storage.getItem(IntegrationAPI.ACCESS_TOKEN) ?? "null") as IntegrationAPIToken | null;

    if (token !== null) {
      const expiresAt = new Date(token.date_created).getTime() + token.expires_in * 1000;
      const refreshAt = Date.now() + IntegrationAPI.REFRESH_THRESHOLD;

      if (expiresAt < refreshAt) {
        this.storage.removeItem(IntegrationAPI.ACCESS_TOKEN);
        this.console.info("Removed old access token from the storage.");
        token = null;
      }
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

      this.console.trace("Access token isn't present in the storage. Fetching a new one...");
      const response = await fetch(url, { method: "POST", headers, body });

      if (response.ok) {
        const props = (await response.json()) as FxToken["props"];
        token = { ...props, date_created: new Date().toISOString() };
        this.storage.setItem(IntegrationAPI.ACCESS_TOKEN, JSON.stringify(token));
        this.console.info("Access token updated.");
      } else {
        this.console.warn("Failed to fetch access token. Proceeding without authentication.");
      }
    }

    const headers = new Headers(init?.headers);
    const method = init?.method?.toUpperCase() ?? "GET";
    const url = typeof input === "string" ? input : input.url;

    headers.set("FOXY-API-VERSION", this.version);
    headers.set("Content-Type", "application/json");
    if (token !== null) headers.set("Authorization", `Bearer ${token.access_token}`);

    this.console.trace(`${method} ${url}`);
    return fetch(input, { ...init, headers });
  }
}
