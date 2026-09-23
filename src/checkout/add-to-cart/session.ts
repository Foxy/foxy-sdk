import { readCachedState, writeCachedState } from "../side-cart/session-cache";

/**
 * How long a click waits for a new session before it goes ahead without one.
 * The visitor then gets a fresh session -- today's behaviour -- instead of a
 * click that seems to do nothing.
 */
export const ENSURE_SESSION_TIMEOUT_MS = 3000;

/** One request per store at a time: a double click must not make two sessions. */
const pending = new Map<string, Promise<string | null>>();

/** The session the sidecart (or an earlier click) cached, or null. */
export function getSession(storeOrigin: string): string | null {
  return readCachedState(storeOrigin)?.sessionId ?? null;
}

/**
 * The cached session, or a new one from `GET /cart?output=json` -- a GET with
 * no params makes the server create a session. Resolves `null` on any
 * failure and never rejects: add-to-cart must never be blocked by this.
 *
 * Needs CORS on `/cart` for the merchant's origin. Until the configurable
 * allowed origins work lands, the request fails and this resolves `null`.
 */
export function ensureSession(storeOrigin: string): Promise<string | null> {
  const cached = getSession(storeOrigin);
  if (cached) return Promise.resolve(cached);

  const inFlight = pending.get(storeOrigin);
  if (inFlight) return inFlight;

  const request = fetchSession(storeOrigin).finally(() => pending.delete(storeOrigin));
  pending.set(storeOrigin, request);
  return request;
}

/** For `empty=reset`: the next add-to-cart starts a new session. */
export function clearSession(storeOrigin: string): void {
  writeCachedState(storeOrigin, { sessionId: null, itemCount: 0 });
}

async function fetchSession(storeOrigin: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENSURE_SESSION_TIMEOUT_MS);

  try {
    const response = await fetch(`${storeOrigin}/cart?output=json`, {
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const json = (await response.json()) as { session?: { id?: unknown } | null };
    const id = json.session?.id;
    if (typeof id !== "string" || id === "") return null;

    writeCachedState(storeOrigin, {
      sessionId: id,
      itemCount: readCachedState(storeOrigin)?.itemCount ?? 0,
    });
    return id;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
