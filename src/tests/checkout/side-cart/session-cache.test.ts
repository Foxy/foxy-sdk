/** @vitest-environment jsdom */
// src/tests/checkout/side-cart/session-cache.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  hashSessionId,
  readCachedState,
  writeCachedState,
} from "../../../checkout/side-cart/session-cache";

const ORIGIN = "https://demo.foxycart.test";

describe("checkout/side-cart/session-cache", () => {
  beforeEach(() => localStorage.clear());

  it("round trips a state for one store origin", () => {
    writeCachedState(ORIGIN, { sessionTag: hashSessionId("s1"), itemCount: 3 });
    expect(readCachedState(ORIGIN)).toEqual({ sessionTag: hashSessionId("s1"), itemCount: 3 });
  });

  it("keeps store origins apart", () => {
    writeCachedState(ORIGIN, { sessionTag: hashSessionId("s1"), itemCount: 3 });
    expect(readCachedState("https://other.foxycart.test")).toBeNull();
  });

  it("returns null for a cold start and for a corrupted entry", () => {
    expect(readCachedState(ORIGIN)).toBeNull();
    localStorage.setItem(`foxy.side-cart.${ORIGIN}`, "{oops");
    expect(readCachedState(ORIGIN)).toBeNull();
    localStorage.setItem(`foxy.side-cart.${ORIGIN}`, '{"sessionId":"s1"}');
    expect(readCachedState(ORIGIN)).toBeNull();
  });

  it("reads an entry from before session tags as invalid", () => {
    // It held the raw session ID. The next write replaces it.
    localStorage.setItem(`foxy.side-cart.${ORIGIN}`, '{"sessionId":"s1","itemCount":3}');
    expect(readCachedState(ORIGIN)).toBeNull();
  });

  it("tags a session ID with a short hash, not the ID", () => {
    expect(hashSessionId("s1")).toMatch(/^[0-9a-f]{8}$/);
    expect(hashSessionId("s1")).toBe(hashSessionId("s1"));
    expect(hashSessionId("s1")).not.toBe(hashSessionId("s2"));
    // 32-bit FNV-1a of "a".
    expect(hashSessionId("a")).toBe("e40c292c");
  });

  it("survives storage being unavailable", () => {
    // Private browsing and blocked site data both make these throw rather than
    // return empty. A cart that cannot open because a cache is unavailable
    // would be a worse bug than a cold start.
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    try {
      expect(readCachedState(ORIGIN)).toBeNull();
      expect(() => writeCachedState(ORIGIN, { sessionTag: null, itemCount: 1 })).not.toThrow();
    } finally {
      getItem.mockRestore();
      setItem.mockRestore();
    }
  });
});
