/** @vitest-environment jsdom */
// src/tests/checkout/session/session.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { APIJson } from "../../../checkout/types";
import { API } from "../../../checkout/API";
import type { SessionStore } from "../../../checkout/session/stores";
import { createApiJson } from "../fixtures/apiJson";

// A PayPal gateway makes `hydrateJson` wait for a script load, which never ends here.
vi.mock("@paypal/paypal-js/sdk-v6", () => ({
  loadCoreSdkScript: vi.fn(() => new Promise(() => undefined)),
}));

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

  it("never runs the first load while hydrateJson is still resolving", async () => {
    const api = new API({});
    api.setStoreDomain("store.test");
    const hosted: APIJson = {
      ...cart("s-hosted"),
      payment_gateways: [{ type: "paypal_platform", client_id: "paypal-client-id" }],
    };

    void api.hydrateJson(hosted);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(api.session.id).toBe("s-hosted");
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

function fakeTransport() {
  return { invoke: vi.fn().mockResolvedValue(undefined), show: vi.fn(), sessionChanged: vi.fn() };
}

describe("client.session.start", () => {
  it("rejects an invalid ID and changes nothing", async () => {
    const api = await boot((a) => a.session.configure({ autoStart: false }));

    await expect(api.session.start("a;b")).rejects.toThrow(TypeError);

    expect(fetch).not.toHaveBeenCalled();
    expect(api.session.id).toBeNull();
  });

  it("adopts an ID: stores it, tells the sidecart, loads the cart", async () => {
    const api = await boot((a) => a.session.configure({ autoStart: false }));
    const transport = fakeTransport();
    api.setSideCartTransport(transport);
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-mine")));

    await api.session.start("s-mine");

    expect(localStorage.getItem(KEY)).toBe("s-mine");
    expect(transport.sessionChanged).toHaveBeenCalledWith("s-mine");
    expect(sessionIdOf(0)).toBe("s-mine");
    expect(api.json?.session?.id).toBe("s-mine");
  });

  it("keeps an adopted ID stored when its cart load fails", async () => {
    const api = await boot((a) => a.session.configure({ autoStart: false }));

    await expect(api.session.start("s-mine")).rejects.toThrow();

    expect(api.session.id).toBe("s-mine");
    expect(localStorage.getItem(KEY)).toBe("s-mine");
  });

  it("creates a new session and replaces the old one", async () => {
    localStorage.setItem(KEY, "s-old");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-old")));
    const api = await boot();
    vi.mocked(fetch).mockClear().mockImplementation(async () => respond(cart("s-new")));

    await api.session.start();

    expect(sessionIdOf(0)).toBeNull();
    expect(api.session.id).toBe("s-new");
    expect(localStorage.getItem(KEY)).toBe("s-new");
  });

  it("keeps the old session when a new one cannot be created", async () => {
    localStorage.setItem(KEY, "s-old");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-old")));
    const api = await boot();
    vi.mocked(fetch).mockRejectedValue(new TypeError("offline"));

    await expect(api.session.start()).rejects.toThrow("offline");

    expect(api.session.id).toBe("s-old");
    expect(localStorage.getItem(KEY)).toBe("s-old");
  });

  it("sends one request for two quick calls", async () => {
    const api = await boot((a) => a.session.configure({ autoStart: false }));
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-new")));

    await Promise.all([api.session.start(), api.session.start()]);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects before a store domain is set, and stores nothing", async () => {
    const onError = vi.fn();
    const api = new API({ onError });

    await expect(api.session.start("s-1")).rejects.toThrow(
      "This API instance is inactive until storeDomain is set.",
    );

    expect(localStorage.length).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("client.session.end", () => {
  it("forgets the session locally", async () => {
    localStorage.setItem(KEY, "s-1");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));
    const api = await boot();
    const transport = fakeTransport();
    api.setSideCartTransport(transport);
    vi.mocked(fetch).mockClear();

    await api.session.end();

    expect(fetch).not.toHaveBeenCalled();
    expect(api.session.id).toBeNull();
    expect(api.json).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(transport.sessionChanged).toHaveBeenCalledWith(null);
  });

  it("with reset, resets on the server and never stores the reset response's ID", async () => {
    const store = spyStore("s-1");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));
    const api = await boot((a) => a.session.configure({ storage: store }));
    vi.mocked(fetch).mockClear().mockImplementation(async () => respond(cart("s-after-reset")));

    await api.session.end({ reset: true });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const body = new URLSearchParams(String(init?.body));
    expect(body.get("empty")).toBe("reset");
    expect(body.get("session_id")).toBe("s-1");
    expect(store.set).not.toHaveBeenCalledWith("s-after-reset");
    expect(store.value).toBeNull();
    expect(api.session.id).toBeNull();
  });

  it("with reset, keeps the session when the reset fails", async () => {
    localStorage.setItem(KEY, "s-1");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));
    const api = await boot();
    vi.mocked(fetch).mockRejectedValue(new TypeError("offline"));

    await expect(api.session.end({ reset: true })).rejects.toThrow("offline");

    expect(api.session.id).toBe("s-1");
    expect(localStorage.getItem(KEY)).toBe("s-1");
  });
});

describe("client.session.ensure", () => {
  it("waits for a first load still in flight instead of making a second session", async () => {
    vi.mocked(fetch).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(respond(cart("s-boot"))), 5)),
    );
    const api = new API({});
    api.setStoreDomain("store.test");
    await new Promise((resolve) => setTimeout(resolve, 0));

    await expect(api.session.ensure()).resolves.toBe("s-boot");

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("creates a session when there is none", async () => {
    const api = await boot((a) => a.session.configure({ autoStart: false }));
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-new")));

    await expect(api.session.ensure()).resolves.toBe("s-new");
  });
});

describe("client.session.configure after the first load", () => {
  async function bootedWith(id: string): Promise<API> {
    localStorage.setItem(KEY, id);
    vi.mocked(fetch).mockImplementation(async () => respond(cart(id)));
    const api = await boot();
    vi.mocked(fetch).mockClear();
    return api;
  }

  /** `configure()` queues the switch; wait for the queue. */
  async function settled(api: API): Promise<void> {
    await api.session.ensure();
  }

  it("moves the session into the new store and empties the old one", async () => {
    const api = await bootedWith("s-1");
    const store = spyStore();

    api.session.configure({ storage: store });
    await settled(api);

    expect(store.value).toBe("s-1");
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("adopts the new store's session and reloads", async () => {
    const api = await bootedWith("s-1");
    const transport = fakeTransport();
    api.setSideCartTransport(transport);
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-2")));

    api.session.configure({ storage: spyStore("s-2") });
    await settled(api);

    expect(api.session.id).toBe("s-2");
    expect(sessionIdOf(0)).toBe("s-2");
    expect(transport.sessionChanged).toHaveBeenCalledWith("s-2");
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("keeps the ID when the same built-in store is configured again", async () => {
    const api = await bootedWith("s-1");

    api.session.configure({ storage: "local" });
    await settled(api);

    expect(localStorage.getItem(KEY)).toBe("s-1");
  });

  it("does nothing when the same custom store is configured again", async () => {
    const store = spyStore("s-1");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));
    const api = await boot((a) => a.session.configure({ storage: store }));

    api.session.configure({ storage: store });
    await settled(api);

    expect(store.remove).not.toHaveBeenCalled();
    expect(store.value).toBe("s-1");
  });

  it("never touches the default store when configured before the domain is set", async () => {
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-new")));

    await boot((a) => a.session.configure({ storage: "memory" }));

    expect(localStorage.length).toBe(0);
  });
});

describe("responses from an old session", () => {
  function later(json: APIJson, ms = 5): Promise<Response> {
    return new Promise((resolve) => setTimeout(() => resolve(respond(json)), ms));
  }

  it("keeps the session the sidecart reported during the first load", async () => {
    vi.mocked(fetch).mockImplementation(() => later(cart("s-boot")));
    const onError = vi.fn();
    const api = new API({ onError });
    api.setStoreDomain("store.test");
    await new Promise((resolve) => setTimeout(resolve, 0)); // the first load is in flight

    api.session.observe("s-frame"); // what the sidecart's report does
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(api.session.id).toBe("s-frame");
    expect(localStorage.getItem(KEY)).toBe("s-frame");
    expect(onError).not.toHaveBeenCalled();
  });

  it("drops a cart change that lands after end()", async () => {
    localStorage.setItem(KEY, "s-1");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));
    const onError = vi.fn();
    const api = await boot(undefined, onError);
    vi.mocked(fetch).mockImplementation(() => later(cart("s-1")));

    api.addItem([["name", "Shirt"], ["price", "10"]]);
    await api.session.end();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(api.session.id).toBeNull();
    expect(api.json).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(onError).not.toHaveBeenCalled();
  });

  it("drops a cart change that lands after start(id)", async () => {
    localStorage.setItem(KEY, "s-1");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));
    const api = await boot();
    vi.mocked(fetch)
      .mockImplementationOnce(() => later(cart("s-1"), 10))
      .mockImplementationOnce(async () => respond(cart("s-2")));

    api.addItem([["name", "Shirt"], ["price", "10"]]);
    await api.session.start("s-2");
    await new Promise((resolve) => setTimeout(resolve, 15));

    expect(api.session.id).toBe("s-2");
    expect(api.json?.session?.id).toBe("s-2");
    expect(localStorage.getItem(KEY)).toBe("s-2");
  });

  it("starts over on the new store when the domain changes after the first load", async () => {
    localStorage.setItem(KEY, "s-1");
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-1")));
    const api = await boot();
    vi.mocked(fetch).mockClear().mockImplementation(async () => respond(cart("s-other")));

    api.setStoreDomain("other.test");

    expect(api.session.id).toBeNull();
    expect(api.json).toBeNull();
    await vi.waitFor(() => expect(api.session.id).toBe("s-other"));
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toMatch(/^https:\/\/other\.test\/cart\?/);
    expect(sessionIdOf(0)).toBeNull();
    expect(localStorage.getItem("foxy.session.other.test")).toBe("s-other");
    expect(localStorage.getItem(KEY)).toBe("s-1");
  });

  it("keeps a hydrated client's session when the domain changes", async () => {
    const api = new API({ initialJson: cart("s-hosted") });
    await api.hydrateJson(cart("s-hosted"));

    api.setStoreDomain("other.test");

    expect(api.session.id).toBe("s-hosted");
    expect(api.json).not.toBeNull();
  });
});

describe("client.session.start and end in one task", () => {
  it("does not join a start() queued before an end()", async () => {
    const api = await boot((a) => a.session.configure({ autoStart: false }));
    vi.mocked(fetch)
      .mockImplementationOnce(async () => respond(cart("s-a")))
      .mockImplementationOnce(async () => respond(cart("s-b")));

    const first = api.session.start();
    void api.session.end();
    const second = api.session.start();
    await Promise.all([first, second]);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(api.session.id).toBe("s-b");
  });

  it("start() resolves after an async store has saved the new ID", async () => {
    let recorded: string | null = null;
    const store: SessionStore = {
      get: () => null,
      set: (id: string) =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            recorded = id;
            resolve();
          }, 20),
        ),
      remove: () => undefined,
    };
    const api = await boot((a) => a.session.configure({ storage: store, autoStart: false }));
    vi.mocked(fetch).mockImplementation(async () => respond(cart("s-new")));

    await api.session.start();

    expect(recorded).toBe("s-new");
  });
});
