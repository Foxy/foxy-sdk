import type { API, SideCartTransport } from "./API";

/**
 * What `side-cart`, `add-to-cart` and `side-cart/origin` need from `client`
 * that merchants must not see. They are separate entry points, so `#private`
 * cannot reach them; this module is not an entry point, so merchants cannot
 * import it. The entries share one copy of it through the build's chunks.
 */
export type ClientInternals = {
  setSideCartTransport(transport: SideCartTransport | null): void;
  /** The sidecart `client` delegates to, or null. `add-to-cart` reads it to choose sidecart mode. */
  sideCartTransport(): SideCartTransport | null;
  /**
   * The store `client` talks to, or null before a domain is set. On a
   * merchant page there is no checkout json to read it from, so the sidecart
   * needs it to build the iframe URL and check the frame's origin.
   */
  storeUrl(): string | null;
  /**
   * A sidecart failure, for both channels a merchant page has: the error
   * message no-ops without checkout json, so it also goes to `onError`.
   */
  reportSideCartError(error: Error): void;
  /** The session the sidecart frame reports. */
  reportSideCartSession(sessionId: string | null): void;
  /** Resolves once the session is known. Never rejects. */
  sessionSettled(): Promise<void>;
};

const registry = new WeakMap<API, ClientInternals>();

export function registerInternals(api: API, internals: ClientInternals): void {
  registry.set(api, internals);
}

export function internalsOf(api: API): ClientInternals {
  const internals = registry.get(api);
  if (!internals) throw new Error("No internals registered for this API instance.");
  return internals;
}
