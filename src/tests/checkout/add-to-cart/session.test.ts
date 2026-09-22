/** @vitest-environment jsdom */
// src/tests/checkout/add-to-cart/session.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ENSURE_SESSION_TIMEOUT_MS,
  clearSession,
  ensureSession,
  getSession,
} from "../../../checkout/add-to-cart/session";
import { readCachedState, writeCachedState } from "../../../checkout/side-cart/session-cache";

const ORIGIN = "https://demo.foxycart.test";

function cartResponse(sessionId: unknown): Response {
  return new Response(JSON.stringify({ session: { id: sessionId }, items: [] }), { status: 200 });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("checkout/add-to-cart/session", () => {
  it("reads the sidecart's cached session", () => {
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 2 });
    expect(getSession(ORIGIN)).toBe("s-1");
  });

  it("returns the cached session without a request", async () => {
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(ensureSession(ORIGIN)).resolves.toBe("s-1");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches a new session once for concurrent callers and caches it", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(cartResponse("s-new"));

    const [first, second] = await Promise.all([ensureSession(ORIGIN), ensureSession(ORIGIN)]);

    expect(first).toBe("s-new");
    expect(second).toBe("s-new");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe(`${ORIGIN}/cart?output=json`);
    expect(readCachedState(ORIGIN)).toEqual({ sessionId: "s-new", itemCount: 0 });
  });

  it("resolves null on an HTTP error, a network error or a bad body", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("", { status: 500 }))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(cartResponse(42));

    await expect(ensureSession(ORIGIN)).resolves.toBeNull();
    await expect(ensureSession(ORIGIN)).resolves.toBeNull();
    await expect(ensureSession(ORIGIN)).resolves.toBeNull();
    expect(getSession(ORIGIN)).toBeNull();
  });

  it("gives up after the timeout", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        }),
    );

    const result = ensureSession(ORIGIN);
    await vi.advanceTimersByTimeAsync(ENSURE_SESSION_TIMEOUT_MS);

    await expect(result).resolves.toBeNull();
  });

  it("clears the session and the count", () => {
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 3 });
    clearSession(ORIGIN);
    expect(readCachedState(ORIGIN)).toEqual({ sessionId: null, itemCount: 0 });
  });
});
