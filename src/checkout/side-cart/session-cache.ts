// src/checkout/side-cart/session-cache.ts

/** The last state the iframe reported, kept on the MERCHANT's origin. */
export type CachedSideCartState = {
  sessionId: string | null;
  itemCount: number;
};

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
    const { sessionId, itemCount } = parsed as Record<string, unknown>;
    if (sessionId !== null && typeof sessionId !== "string") return null;
    if (typeof itemCount !== "number") return null;
    return { sessionId, itemCount };
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
