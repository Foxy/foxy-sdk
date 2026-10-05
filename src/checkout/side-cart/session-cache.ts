// src/checkout/side-cart/session-cache.ts

/**
 * The last state the iframe reported, kept on the MERCHANT's origin, in
 * `localStorage`, whatever store `client.session` uses. So it holds a tag
 * of the session ID, never the ID: the ID is a bearer token for the cart.
 */
export type CachedSideCartState = {
  sessionTag: string | null;
  itemCount: number;
};

/** 32-bit FNV-1a, as 8 hex digits. Enough to match a count to its session; the ID cannot be read back from it. */
export function hashSessionId(id: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

const KEY_PREFIX = "foxy.side-cart.";

export function readCachedState(storeOrigin: string): CachedSideCartState | null {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(`${KEY_PREFIX}${storeOrigin}`);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    // An entry from before tags has `sessionId` instead: invalid, and replaced on the next write.
    const { sessionTag, itemCount } = parsed as Record<string, unknown>;
    if (sessionTag !== null && typeof sessionTag !== "string") return null;
    if (typeof itemCount !== "number") return null;
    return { sessionTag, itemCount };
  } catch {
    return null;
  }
}

export function writeCachedState(
  storeOrigin: string,
  state: CachedSideCartState,
): void {
  try {
    localStorage.setItem(`${KEY_PREFIX}${storeOrigin}`, JSON.stringify(state));
  } catch {
    // Nothing to do and nothing worth reporting: the cache is an optimization,
    // and the iframe reports the authoritative state on every connect.
  }
}
