/** @vitest-environment jsdom */
// src/tests/checkout/session/stores.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkStoreOptions,
  createStore,
  defaultSessionKey,
  isSessionId,
} from "../../../checkout/session/stores";

function clearCookies(): void {
  for (const pair of document.cookie.split(/;\s*/)) {
    const name = pair.split("=")[0];
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  clearCookies();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isSessionId", () => {
  it("accepts any non-empty string: the server owns the format, and every use encodes it", () => {
    for (const value of ["abc_DEF-123", "k3j4h5g6f7d8s9a0p1o2i3u4y5", "abc,def123", "a b", "a;b", "a=b", "é", "a".repeat(1000)]) {
      expect(isSessionId(value)).toBe(true);
    }
  });

  it("rejects an empty string and non-strings", () => {
    for (const value of ["", 42, null, undefined, {}]) {
      expect(isSessionId(value)).toBe(false);
    }
  });
});

describe("defaultSessionKey", () => {
  it("uses the store host", () => {
    expect(defaultSessionKey("https://example.foxycart.com")).toBe("foxy.session.example.foxycart.com");
  });

  it("makes a port cookie-name safe", () => {
    expect(defaultSessionKey("https://foxycart.test:8443")).toBe("foxy.session.foxycart.test_8443");
  });
});

describe("checkStoreOptions", () => {
  it("rejects an unknown storage name", () => {
    expect(() => checkStoreOptions("disk" as never, undefined)).toThrow(TypeError);
  });

  it("rejects a cookie key a cookie name cannot hold", () => {
    expect(() => checkStoreOptions("cookie", "fc sid")).toThrow(TypeError);
    expect(() => checkStoreOptions("cookie", "fc;sid")).toThrow(TypeError);
  });

  it("rejects a cookie domain or path with ';' or whitespace", () => {
    expect(() => checkStoreOptions("cookie", "fc_sid", { domain: ".a.com; Secure" })).toThrow(TypeError);
    expect(() => checkStoreOptions("cookie", "fc_sid", { path: "/ x" })).toThrow(TypeError);
  });

  it('rejects sameSite "None" on an http: page', () => {
    expect(location.protocol).toBe("http:");
    expect(() => checkStoreOptions("cookie", "fc_sid", { sameSite: "None" })).toThrow(TypeError);
  });

  it("rejects a sameSite that is not Strict, Lax or None", () => {
    expect(() => checkStoreOptions("cookie", "fc_sid", { sameSite: "Lax; Domain=x" as never })).toThrow(
      TypeError,
    );
  });

  it("rejects a maxAge that is not a finite integer", () => {
    for (const maxAge of [Number.NaN, Number.POSITIVE_INFINITY, 1.5]) {
      expect(() => checkStoreOptions("cookie", "fc_sid", { maxAge })).toThrow(TypeError);
    }
    expect(() => checkStoreOptions("cookie", "fc_sid", { maxAge: 2592000 })).not.toThrow();
  });

  it("rejects an empty cookie path", () => {
    expect(() => checkStoreOptions("cookie", "fc_sid", { path: "" })).toThrow(TypeError);
  });

  it("accepts any key for non-cookie storage", () => {
    expect(() => checkStoreOptions("local", "any key: at all")).not.toThrow();
  });
});

describe("memory store", () => {
  it("keeps one ID per store", () => {
    const one = createStore("memory", "k");
    const two = createStore("memory", "k");
    one.set("s-1");
    expect(one.get()).toBe("s-1");
    expect(two.get()).toBeNull();
    one.remove();
    expect(one.get()).toBeNull();
  });
});

describe.each([
  ["local", () => localStorage],
  ["session", () => sessionStorage],
] as const)("%s store", (name, storage) => {
  it("reads and writes under the key", () => {
    const store = createStore(name, "fc_sid");
    expect(store.get()).toBeNull();
    store.set("s-1");
    expect(storage().getItem("fc_sid")).toBe("s-1");
    expect(store.get()).toBe("s-1");
    store.remove();
    expect(storage().getItem("fc_sid")).toBeNull();
  });

  it("falls back to memory when the storage is blocked", () => {
    const blocked = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(blocked);

    const store = createStore(name, "fc_sid");
    store.set("s-1");
    expect(store.get()).toBe("s-1");
    store.remove();
    expect(store.get()).toBeNull();
  });
});

describe("cookie store", () => {
  it("writes the ID with the default attributes on an http: page", () => {
    const write = vi.spyOn(Document.prototype, "cookie", "set");
    createStore("cookie", "fc_sid").set("s-1");
    expect(write).toHaveBeenCalledWith("fc_sid=s-1; Path=/; SameSite=Lax");
  });

  it("writes every option it is given", () => {
    const write = vi.spyOn(Document.prototype, "cookie", "set");
    createStore("cookie", "fc_sid", {
      domain: ".example.com",
      path: "/shop",
      maxAge: 600,
      sameSite: "Strict",
    }).set("s-1");
    expect(write).toHaveBeenCalledWith(
      "fc_sid=s-1; Path=/shop; Domain=.example.com; SameSite=Strict; Max-Age=600",
    );
  });

  it("adds Secure on an https: page", () => {
    vi.spyOn(window, "location", "get").mockReturnValue({ protocol: "https:" } as Location);
    const write = vi.spyOn(Document.prototype, "cookie", "set");
    createStore("cookie", "fc_sid").set("s-1");
    expect(write).toHaveBeenCalledWith("fc_sid=s-1; Path=/; SameSite=Lax; Secure");
  });

  it("reads back only the cookie with exactly that name", () => {
    document.cookie = "fc_sid2=other; Path=/";
    const store = createStore("cookie", "fc_sid");
    expect(store.get()).toBeNull();
    store.set("s-1");
    expect(store.get()).toBe("s-1");
  });

  it("removes the cookie with Max-Age=0", () => {
    const store = createStore("cookie", "fc_sid");
    store.set("s-1");
    const write = vi.spyOn(Document.prototype, "cookie", "set");
    store.remove();
    expect(write).toHaveBeenCalledWith("fc_sid=; Path=/; SameSite=Lax; Max-Age=0");
    expect(store.get()).toBeNull();
  });
});
