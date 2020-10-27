import MemoryStorage from "ministorage";
import ow from "ow";
import { BrowserAPI, BrowserAPIAuthError } from "../core/BrowserAPI";
import { isStorage, ScopedStorage } from "../core/ScopedStorage";
import { Graph } from "../core/types";
import { RequestEvent } from "./RequestEvent";

enum BrowserStorage {
  session = "session",
  local = "local",
}

enum ReservedURI {
  SignIn = "foxy://sign-in",
  SignOut = "foxy://sign-out",
  ResetPassword = "foxy://reset-password",
}

const statusMap = {
  NEW_PASSWORD_REQUIRED: 205,
  UNAUTHORIZED: 401,
  UNKNOWN: 500,
};

export class APIElement<G extends Graph, A extends BrowserAPI<G>> extends HTMLElement {
  static readonly observedAttributes = ["api", "base", "storage"];

  private __storageInstance: Storage = new MemoryStorage();
  private __storage: Storage | BrowserStorage = new MemoryStorage();

  private __apiInstance: Promise<A> | null = null;
  private __apiModule: Promise<any> | null = null;
  private __api: Promise<A> | string | null = null;

  private __baseURL: URL | null = null;
  private __base: URL | string | null = null;

  constructor() {
    super();

    this.addEventListener("request", (evt) => {
      (evt as RequestEvent).detail.handle((input, init) => {
        switch (input) {
          case ReservedURI.SignIn:
            return this.__handleSignIn(init);
          case ReservedURI.SignOut:
            return this.__handleSignOut();
          case ReservedURI.ResetPassword:
            return this.__handlePasswordReset(init);
          default:
            return this.__handleRequest(input, init);
        }
      });
    });
  }

  get api(): Promise<A> | string | null {
    return this.__api;
  }

  set api(newValue: Promise<A> | string | null) {
    ow(newValue, ow.any(ow.promise, ow.string, ow.null));

    this.__api = newValue;
    this.__apiModule = this.__createApiModuleLoader();
    this.__apiInstance = this.__createApiInstance();
  }

  get base(): URL | string | null {
    return this.__base;
  }

  set base(newValue: URL | string | null) {
    ow(newValue, ow.any(ow.null, ow.string, ow.object.instanceOf(URL)));

    this.__base = newValue;
    this.__baseURL = newValue ? new URL(newValue.toString()) : null;
    this.__apiInstance = this.__createApiInstance();
  }

  get storage(): Storage | BrowserStorage {
    return this.__storage;
  }

  set storage(newValue: Storage | BrowserStorage) {
    ow(newValue, ow.any(ow.object.partialShape(isStorage), ow.string.oneOf(["local", "session"])));

    this.__storage = newValue;
    this.__storageInstance = this.__createStorageInstance();
    this.__apiInstance = this.__createApiInstance();
  }

  attributeChangedCallback(name: string, _: never, newValue: string | null): void {
    ow(name, ow.string);
    ow(newValue, ow.any(ow.string, ow.null));

    if (name === "api") return void (this.api = newValue);
    if (name === "base") return void (this.base = newValue);
    if (name === "storage") return void (this.storage = (newValue as Storage | BrowserStorage) ?? new MemoryStorage());
  }

  private __createApiModuleLoader() {
    return typeof this.__api === "string"
      ? import(this.__api).then((v) => v.default ?? [...Object.values(v)].find((c) => typeof c === "function"))
      : this.__api;
  }

  private __createStorageInstance() {
    if (typeof this.__storage === "object") return this.__storage;
    const provider = this.__storage === BrowserStorage.session ? sessionStorage : localStorage;
    return new ScopedStorage("@foxy.io/api", provider);
  }

  private __createErrorResponse() {
    return new Response(null, { status: 500, statusText: "MISCONFIGURED" });
  }

  private __createApiInstance() {
    if (this.__apiModule === null) {
      return null;
    } else {
      return this.__apiModule.then((constructor) => {
        if (this.__baseURL === null) return null;
        return new constructor({ baseURL: this.__baseURL, storage: this.__storageInstance });
      });
    }
  }

  private async __handlePasswordReset(init?: RequestInit) {
    if (!this.__apiInstance) return this.__createErrorResponse();

    try {
      const api = await this.__apiInstance;
      await api.sendPasswordResetEmail(JSON.parse(init?.body?.toString() ?? "{}"));
      return new Response(null, { status: 200 });
    } catch (err) {
      if (err instanceof BrowserAPIAuthError) {
        return new Response(null, { status: statusMap[err.code], statusText: err.code });
      } else {
        return new Response(null, { status: 500, statusText: "UNKNOWN" });
      }
    }
  }

  private async __handleRequest(input: RequestInfo, init?: RequestInit) {
    if (!this.__apiInstance) return this.__createErrorResponse();
    return (await this.__apiInstance).fetch(input, init);
  }

  private async __handleSignOut() {
    if (!this.__apiInstance) return this.__createErrorResponse();

    try {
      await (await this.__apiInstance).signOut();
      return new Response(null, { status: 200 });
    } catch (err) {
      if (err instanceof BrowserAPIAuthError) {
        return new Response(null, { status: statusMap[err.code], statusText: err.code });
      } else {
        return new Response(null, { status: 500, statusText: "UNKNOWN" });
      }
    }
  }

  private async __handleSignIn(init?: RequestInit) {
    if (!this.__apiInstance) return this.__createErrorResponse();

    try {
      await (await this.__apiInstance).signIn(JSON.parse(init?.body?.toString() ?? "{}"));
      return new Response(null, { status: 200 });
    } catch (err) {
      if (err instanceof BrowserAPIAuthError) {
        return new Response(null, { status: statusMap[err.code], statusText: err.code });
      } else {
        return new Response(null, { status: 500, statusText: "UNKNOWN" });
      }
    }
  }
}
