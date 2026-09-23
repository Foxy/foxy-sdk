/** @vitest-environment jsdom */
// src/tests/checkout/add-item.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API } from "../../checkout/API";
import type { APIJson } from "../../checkout/types";

function minimalJson(sessionId: string | null): APIJson {
  return {
    items: [],
    messages: [],
    store: { domain: null },
    session: { id: sessionId },
  } as unknown as APIJson;
}

function okResponse(json: APIJson): Response {
  return new Response(JSON.stringify(json), { status: 200 });
}

beforeEach(() => {
  // API's constructor fires a deferred auto-GET of /cart (see API.ts's
  // setTimeout) whenever it is built without hydrated json. Left unmocked,
  // that becomes a real network call once this file's fake timers or awaits
  // let the timeout fire. Tests that need a response override this with
  // `vi.mocked(fetch).mockResolvedValue(...)` instead of a fresh spy.
  vi.spyOn(globalThis, "fetch").mockRejectedValue(
    new Error("network disabled in tests"),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("checkout/API addItem", () => {
  it("posts the pairs in order, with repeated and signed names untouched", async () => {
    const api = new API({ storeDomain: "demo.foxycart.test" });
    await api.hydrateJson(minimalJson("s-1"));
    vi.mocked(fetch).mockResolvedValue(okResponse(minimalJson("s-1")));

    api.addItem([
      ["name||a1b2", "Shirt"],
      ["price||c3d4", "10"],
      ["name", "Hat"],
      ["name", "Scarf"],
    ]);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://demo.foxycart.test/cart");
    const body = init?.body as URLSearchParams;
    expect([...body]).toEqual([
      ["name||a1b2", "Shirt"],
      ["price||c3d4", "10"],
      ["name", "Hat"],
      ["name", "Scarf"],
      ["output", "json"],
      ["session_id", "s-1"],
    ]);
  });

  it("uses its own session over a session_id pair", async () => {
    const api = new API({ storeDomain: "demo.foxycart.test" });
    await api.hydrateJson(minimalJson("s-own"));
    vi.mocked(fetch).mockResolvedValue(okResponse(minimalJson("s-own")));

    api.addItem([["name", "Shirt"], ["session_id", "s-other"]]);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const body = vi.mocked(fetch).mock.calls[0][1]?.body as URLSearchParams;
    expect(body.getAll("session_id")).toEqual(["s-own"]);
  });

  it("keeps empty=reset in the same request", async () => {
    const api = new API({ storeDomain: "demo.foxycart.test" });
    await api.hydrateJson(minimalJson("s-1"));
    vi.mocked(fetch).mockResolvedValue(okResponse(minimalJson("s-2")));

    api.addItem([["empty", "reset"], ["name", "Shirt"]]);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const body = vi.mocked(fetch).mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("empty")).toBe("reset");
    await vi.waitFor(() => expect(api.json?.session?.id).toBe("s-2"));
  });

  it("rejects params that are not string pairs, without a request", async () => {
    const api = new API({ storeDomain: "demo.foxycart.test" });
    await api.hydrateJson(minimalJson("s-1"));

    api.addItem([["name"]] as unknown as [string, string][]);

    expect(fetch).not.toHaveBeenCalled();
    expect(api.json?.messages).toContainEqual({
      context: "item-add",
      message: "addItem requires a list of [name, value] string pairs.",
      level: "error",
    });
  });

  it("is delegated to the sidecart on a merchant page", () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const api = new API({ storeDomain: "demo.foxycart.test" });

    api.setSideCartTransport({ invoke, show: vi.fn() });
    api.addItem([["name", "Shirt"]]);

    expect(invoke).toHaveBeenCalledWith("addItem", [[["name", "Shirt"]]]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("exposes the transport it delegates to", () => {
    const api = new API({ storeDomain: "demo.foxycart.test" });
    const transport = { invoke: vi.fn(), show: vi.fn() };

    expect(api.sideCartTransport).toBeNull();
    api.setSideCartTransport(transport);
    expect(api.sideCartTransport).toBe(transport);
  });
});
