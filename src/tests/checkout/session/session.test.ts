/** @vitest-environment jsdom */
// src/tests/checkout/session/session.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { APIJson } from "../../../checkout/types";
import { API } from "../../../checkout/API";
import type { SessionStore } from "../../../checkout/session/stores";
import { createApiJson } from "../fixtures/apiJson";

const KEY = "foxy.session.store.test";

function cart(sessionId: string | null): APIJson {
  return { ...createApiJson(), session: { id: sessionId } };
}

/** A new `Response` per call: a body can be read only once. Always mock with `mockImplementation(async () => respond(...))`. */
function respond(json: APIJson): Response {
  return new Response(JSON.stringify(json), { status: 200 });
}

/** The `session_id` of fetch call `n`: from the URL for a GET, from the body for a POST. */
function sessionIdOf(n: number): string | null {
  const [input, init] = vi.mocked(fetch).mock.calls[n];
  const url = new URL(String(input));
  if (init?.method === "POST") return new URLSearchParams(String(init.body)).get("session_id");
  return url.searchParams.get("session_id");
}

/** Creates a client the way `checkout/loader` does, lets the caller configure it, then waits for the boot. */
async function boot(configure?: (api: API) => void, onError = vi.fn()): Promise<API> {
  const api = new API({ onError });
  configure?.(api);
  api.setStoreDomain("store.test");
  await new Promise((resolve) => setTimeout(resolve, 0));
  await vi.waitFor(() => expect(api.state).toBe("idle"));
  return api;
}

function spyStore(initial: string | null = null): SessionStore & { value: string | null } {
  const store = {
    value: initial,
    get: vi.fn(() => store.value),
    set: vi.fn((id: string) => {
      store.value = id;
    }),
    remove: vi.fn(() => {
      store.value = null;
    }),
  };
  return store;
}

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("unmocked fetch"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("client.session boot", () => {
  it("loads the stored session", async () => {
    localStorage.setItem(KEY, "s-1");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));

    const api = await boot();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(sessionIdOf(0)).toBe("s-1");
    expect(api.session.id).toBe("s-1");
  });

  it("creates and stores a session when none is stored", async () => {
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-new")));

    const api = await boot();

    expect(sessionIdOf(0)).toBeNull();
    expect(api.session.id).toBe("s-new");
    expect(localStorage.getItem(KEY)).toBe("s-new");
  });

  it("waits for start() with autoStart: false", async () => {
    const api = await boot((a) => a.session.configure({ autoStart: false }));

    expect(fetch).not.toHaveBeenCalled();
    expect(api.json).toBeNull();
    expect(api.session.id).toBeNull();
  });

  it("awaits an async custom store", async () => {
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));
    const store: SessionStore = {
      get: () => new Promise((resolve) => setTimeout(() => resolve("s-1"), 5)),
      set: vi.fn(),
      remove: vi.fn(),
    };

    const api = await boot((a) => a.session.configure({ storage: store }));

    expect(sessionIdOf(0)).toBe("s-1");
    expect(api.session.id).toBe("s-1");
    expect(store.set).not.toHaveBeenCalled();
  });

  it("stores the new ID when the server answers with another session", async () => {
    localStorage.setItem(KEY, "s-expired");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-new")));

    const api = await boot();

    expect(api.session.id).toBe("s-new");
    expect(localStorage.getItem(KEY)).toBe("s-new");
  });

  it("treats a failing store as empty and reports it", async () => {
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-new")));
    const onError = vi.fn();
    const store: SessionStore = {
      get: () => Promise.reject(new Error("backend down")),
      set: vi.fn(),
      remove: vi.fn(),
    };

    const api = await boot((a) => a.session.configure({ storage: store }), onError);

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "backend down" }));
    expect(api.session.id).toBe("s-new");
  });

  it("ignores an invalid stored value without deleting it", async () => {
    localStorage.setItem(KEY, "a;b");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-new")));
    const onError = vi.fn();

    await boot(undefined, onError);

    expect(sessionIdOf(0)).toBeNull();
    expect(onError).toHaveBeenCalled();
  });

  it("does not store an invalid ID from the server", async () => {
    vi.mocked(fetch).mockImplementation(async () => respond(cart("a;b")));
    const onError = vi.fn();

    const api = await boot(undefined, onError);

    expect(api.session.id).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(onError).toHaveBeenCalled();
  });

  it("sends the session on later requests", async () => {
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));
    const api = await boot();

    api.addItem([["name", "Shirt"], ["price", "10"]]);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    expect(sessionIdOf(1)).toBe("s-1");
  });
});

describe("client.session on a hydrated client", () => {
  it("takes the ID from the json and never touches the store", async () => {
    const store = spyStore();
    const api = new API({ initialJson: cart("s-hosted") });
    api.session.configure({ storage: store });

    await api.hydrateJson(cart("s-hosted-2"));

    expect(api.session.id).toBe("s-hosted-2");
    expect(store.get).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });
});

describe("client.session.configure", () => {
  it("throws at the call for bad options", () => {
    const api = new API({});
    expect(() => api.session.configure({ storage: "disk" as never })).toThrow(TypeError);
    expect(() => api.session.configure({ storage: "cookie", key: "a b" })).toThrow(TypeError);
  });

  it("uses the chosen built-in store and key", async () => {
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-new")));

    await boot((a) => a.session.configure({ storage: "session", key: "fc_sid" }));

    expect(sessionStorage.getItem("fc_sid")).toBe("s-new");
    expect(localStorage.length).toBe(0);
  });
});
