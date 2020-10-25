import MemoryStorage from "ministorage";
import { API } from "./API";
import { BrowserAPICredentials, BrowserAPIParameters } from "./types/auth";
import { Graph } from "./types";

export abstract class BrowserAPI<TGraph extends Graph> extends API<TGraph> {
  constructor(params: BrowserAPIParameters) {
    super({
      storage: params?.storage ?? new MemoryStorage(),
      baseURL: params.baseURL,
      fetch: (...args) => this.fetch(...args),
    });
  }

  abstract fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

  abstract signIn(credentials: BrowserAPICredentials): Promise<void>;

  abstract sendPasswordResetEmail(email: string): Promise<void>;

  abstract signOut(): Promise<void>;
}
