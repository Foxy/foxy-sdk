/** @vitest-environment jsdom */
// src/tests/checkout/side-cart/side-cart.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { APIJson } from "../../../checkout/types";

const STORE_ORIGIN = "https://demo.foxycart.test";

async function loadSideCart() {
  vi.resetModules();
  const { client } = await import("../../../checkout/client");
  client.setStoreDomain("demo.foxycart.test");
  const module = await import("../../../checkout/side-cart");

  return { client, sideCart: module.sideCart };
}

/**
 * A merchant script can import this module before anything has told `client`
 * what store it is on -- `checkout/loader.js` hasn't run yet, or never will
 * on a bare-hostname/test-harness page. Deliberately skips
 * `client.setStoreDomain(...)`, unlike `loadSideCart()` above, so the origin
 * can only fall back to `location.hostname` -- vitest's default jsdom
 * location is `http://localhost:3000/`, a bare hostname with no dot and,
 * with no `VITE_FOXYCART_DOMAIN` configured for this test run,
 * unresolvable via `resolveBaseUrlFromStoreDomain`.
 */
async function loadSideCartWithoutStoreDomain() {
  vi.resetModules();
  const { client } = await import("../../../checkout/client");
  const module = await import("../../../checkout/side-cart");

  return { client, sideCart: module.sideCart };
}

function frame(): HTMLIFrameElement | null {
  return document.querySelector("iframe[data-foxy-side-cart]");
}

/**
 * Answers the sidecart's own announcement handshake the way the frame would,
 * and hands back the frame-side port so a test can post `ready`/`state`
 * messages through it. `sideCart.mount()` must have run first.
 *
 * Spying on the iframe's `contentWindow.postMessage` -- the same trick
 * `channel.test.ts` uses to inspect the transferred port -- sidesteps jsdom
 * not actually delivering a message across two window objects: the spy still
 * calls through, so it hands back the very same, still-usable `MessagePort`
 * the channel transferred, without needing that delivery to happen.
 */
function connectFrame(): MessagePort {
  const win = frame()!.contentWindow!;
  const postMessageSpy = vi.spyOn(win, "postMessage");

  dispatchEvent(
    new MessageEvent("message", {
      data: { type: "awaiting-connect" },
      origin: STORE_ORIGIN,
      source: win,
    }),
  );

  const [, , transfer] = postMessageSpy.mock.calls[0] as unknown as [
    unknown,
    string,
    Transferable[],
  ];
  postMessageSpy.mockRestore();

  return transfer[0] as MessagePort;
}

describe("checkout/side-cart", () => {
  // `loadSideCart()`'s `client.setStoreDomain(...)` call always kicks off a
  // real, unmocked fetch as a side effect of the client's own pre-existing
  // auto-hydrate behavior (API.ts's constructor `setTimeout` and
  // `setStoreDomain` itself) -- nothing in this file relies on it resolving.
  // Left unmocked, it's a real DNS lookup racing test/file teardown, and it
  // has been observed rejecting late enough to land in an unrelated test
  // file's realm and crash there. Rejecting it immediately keeps that stray
  // promise inside the test that started it.
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network disabled in tests"));
  });

  afterEach(async () => {
    // The mocked-rejected fetch above still leaves a promise chain running
    // inside `client` (`runMutation`'s catch, `addErrorMessage`, `setState`'s
    // `dispatchEvent`) -- and there are two independent starts of it per
    // test: `setStoreDomain`'s own immediate call, and the constructor's own
    // deferred `setTimeout`. A couple of ticks lets both finish inside the
    // test that started them, instead of settling after this file's jsdom
    // environment is torn down and crashing whatever file's realm is current
    // by then.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    vi.restoreAllMocks();
  });

  it("mounts no iframe until something asks for one", async () => {
    await loadSideCart();

    expect(frame()).toBeNull();
  });

  it("reports an unknown item count on a cold start", async () => {
    const { sideCart } = await loadSideCart();
    expect(sideCart.itemCount).toBeNull();
  });

  it("reports the cached item count when there is one", async () => {
    localStorage.setItem(
      `foxy.side-cart.${STORE_ORIGIN}`,
      JSON.stringify({ sessionId: "s1", itemCount: 4 }),
    );

    const { sideCart } = await loadSideCart();
    expect(sideCart.itemCount).toBe(4);
  });

  it("mounts a hidden iframe carrying the cached session id", async () => {
    localStorage.setItem(
      `foxy.side-cart.${STORE_ORIGIN}`,
      JSON.stringify({ sessionId: "s1", itemCount: 4 }),
    );

    const { sideCart } = await loadSideCart();
    sideCart.mount();

    const element = frame();
    expect(element).not.toBeNull();
    expect(element?.src).toBe(`${STORE_ORIGIN}/cart?session_id=s1`);
    expect(element?.style.display).toBe("none");
  });

  it("shows and hides, firing events and inerting the page behind it", async () => {
    const other = document.createElement("div");
    document.body.appendChild(other);

    const { sideCart } = await loadSideCart();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    sideCart.addEventListener("open", onOpen);
    sideCart.addEventListener("close", onClose);

    sideCart.show();
    expect(sideCart.open).toBe(true);
    expect(frame()?.style.display).toBe("block");
    expect(other.inert).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);

    sideCart.hide();
    expect(sideCart.open).toBe(false);
    expect(frame()?.style.display).toBe("none");
    expect(other.inert).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mounts on the first delegated mutation without opening", async () => {
    const { client, sideCart } = await loadSideCart();

    client.clearCart();

    expect(frame()).not.toBeNull();
    expect(sideCart.open).toBe(false);
  });

  it("prefers the client's own item count over the cache", async () => {
    localStorage.setItem(
      `foxy.side-cart.${STORE_ORIGIN}`,
      JSON.stringify({ sessionId: "s1", itemCount: 4 }),
    );

    const { client, sideCart } = await loadSideCart();
    await client.hydrateJson({
      items: [{}, {}],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    expect(sideCart.itemCount).toBe(2);
  });

  it("does not emit itemcountchange when the client's update leaves the count unchanged", async () => {
    const { client, sideCart } = await loadSideCart();
    const onItemCountChange = vi.fn();
    sideCart.addEventListener("itemcountchange", onItemCountChange);

    client.dispatchEvent(new Event("update"));

    expect(onItemCountChange).not.toHaveBeenCalled();
  });

  it("emits itemcountchange exactly once when the client's update changes the count", async () => {
    const { client, sideCart } = await loadSideCart();
    const onItemCountChange = vi.fn();
    sideCart.addEventListener("itemcountchange", onItemCountChange);

    await client.hydrateJson({
      items: [{}, {}],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    expect(onItemCountChange).toHaveBeenCalledTimes(1);
  });

  it("reports the count the iframe last announced over an older client json", async () => {
    const { client, sideCart } = await loadSideCart();
    await client.hydrateJson({
      items: [{}, {}, {}],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    sideCart.mount();
    const framePort = connectFrame();
    framePort.postMessage(
      JSON.stringify({ type: "state", sessionId: "s2", itemCount: 1, total: 500 }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(sideCart.itemCount).toBe(1);
  });

  it("a reported count of zero wins over a non-zero client json", async () => {
    const { client, sideCart } = await loadSideCart();
    await client.hydrateJson({
      items: [{}, {}],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    sideCart.mount();
    const framePort = connectFrame();
    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s3", itemCount: 0 }));
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(sideCart.itemCount).toBe(0);
  });

  it("does not throw on import when the store origin cannot yet be resolved", async () => {
    // Reaching this line at all is the assertion: the round-2
    // `#lastAnnouncedCount` field initializer reads `itemCount`, which used
    // to propagate `resolveBaseUrlFromStoreDomain`'s throw straight out of
    // `new SideCart()` -- i.e. out of importing this module.
    const { sideCart } = await loadSideCartWithoutStoreDomain();

    expect(sideCart.itemCount).toBeNull();
  });

  it("still throws from mount() when the store origin cannot be resolved", async () => {
    const { sideCart } = await loadSideCartWithoutStoreDomain();

    expect(() => sideCart.mount()).toThrow(
      "VITE_FOXYCART_DOMAIN is required when using a Foxy subdomain storeDomain.",
    );
  });
});
