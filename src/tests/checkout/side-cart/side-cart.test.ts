/** @vitest-environment jsdom */
// src/tests/checkout/side-cart/side-cart.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { APIJson } from "../../../checkout/types";

const STORE_ORIGIN = "https://demo.foxycart.test";

/**
 * The singleton `loadSideCart()` last handed out. `vi.resetModules()` makes a
 * fresh one per test, so `afterEach` cannot reach it any other way -- and a
 * mounted sidecart that is never unmounted leaves its channel's `message`
 * listener on the jsdom window that every test in this file shares.
 */
let mounted: { unmount(): void } | null = null;

async function loadSideCart() {
  vi.resetModules();
  const { client } = await import("../../../checkout/client");
  client.setStoreDomain("demo.foxycart.test");
  const module = await import("../../../checkout/side-cart");
  mounted = module.sideCart;

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
  mounted = module.sideCart;

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

/** One MessagePort round trip. */
function settle(): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, 10));
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
    mounted?.unmount();
    mounted = null;
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
    // Belt and braces against a UA filling the iframe's own canvas -- the
    // opaque-backdrop bug itself is the cart page's body background, fixed
    // in foxy-checkout, not here.
    expect(element?.style.background).toBe("transparent");
  });

  it("shows and hides, firing events", async () => {
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
    expect(onOpen).toHaveBeenCalledTimes(1);

    sideCart.hide();
    expect(sideCart.open).toBe(false);
    // Immediate effects only. The frame owns the close animation, so the
    // iframe stays visible until it reports `closed` -- covered by its own
    // tests below, alongside the fallback and the pending-close races.
    expect(frame()?.style.display).toBe("block");
    // `inert` is covered by its own tests below: it is held until the frame
    // reports `ready`, so `show()` alone never sets it.
    expect(other.inert).toBeFalsy();
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
      items: [{ quantity: 1 }, { quantity: 1 }],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    expect(sideCart.itemCount).toBe(2);
  });

  it("sums unit quantity from the client's json, not the number of line items", async () => {
    // A single line item at quantity 3 -- items.length would say 1, but the
    // drawer's own header reads "3 items", and the badge has to agree with
    // it before the frame has ever reported.
    const { client, sideCart } = await loadSideCart();
    await client.hydrateJson({
      items: [{ quantity: 3 }],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    expect(sideCart.itemCount).toBe(3);
  });

  it("clamps a negative quantity to zero instead of letting it subtract", async () => {
    const { client, sideCart } = await loadSideCart();
    await client.hydrateJson({
      items: [{ quantity: 3 }, { quantity: -5 }],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    expect(sideCart.itemCount).toBe(3);
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
      items: [{ quantity: 1 }, { quantity: 1 }],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    expect(onItemCountChange).toHaveBeenCalledTimes(1);
  });

  it("reports the count the iframe last announced over an older client json", async () => {
    const { client, sideCart } = await loadSideCart();
    await client.hydrateJson({
      items: [{ quantity: 1 }, { quantity: 1 }, { quantity: 1 }],
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
      items: [{ quantity: 1 }, { quantity: 1 }],
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

  it("still refuses to mount when the store origin cannot be resolved", async () => {
    const { sideCart } = await loadSideCartWithoutStoreDomain();

    expect(() => sideCart.mount()).toThrow(/does not know which store/);
    expect(frame()).toBeNull();
  });

  it("keeps the page behind interactive until the frame reports ready", async () => {
    const other = document.createElement("div");
    document.body.appendChild(other);

    const { sideCart } = await loadSideCart();
    sideCart.show();

    // A frame that never connects -- store outage, a frame-src CSP, a
    // tracking blocker -- renders no close button of its own. Inerting the
    // page behind it before it is alive is what leaves the shopper with
    // nothing but a reload.
    expect(other.inert).toBeFalsy();

    const framePort = connectFrame();
    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 0 }));
    await settle();

    expect(other.inert).toBe(true);
  });

  it("closes on Escape from the host page", async () => {
    const other = document.createElement("div");
    document.body.appendChild(other);

    const { sideCart } = await loadSideCart();
    const onClose = vi.fn();
    sideCart.addEventListener("close", onClose);
    sideCart.show();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(sideCart.open).toBe(false);
    // Immediate effects only -- see the `hide()` test above for why this
    // isn't "none" yet.
    expect(frame()?.style.display).toBe("block");
    expect(other.inert).toBeFalsy();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stops listening for Escape once closed", async () => {
    const { sideCart } = await loadSideCart();
    sideCart.show();
    sideCart.hide();
    const onClose = vi.fn();
    sideCart.addEventListener("close", onClose);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps the iframe visible and the page inert until the frame reports closed", async () => {
    const other = document.createElement("div");
    document.body.appendChild(other);

    const { sideCart } = await loadSideCart();
    sideCart.show();
    const framePort = connectFrame();
    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 0 }));
    await settle();
    expect(other.inert).toBe(true);

    sideCart.hide();

    // The frame owns the close animation: still visible, page still inert.
    expect(sideCart.open).toBe(false);
    expect(frame()?.style.display).toBe("block");
    expect(other.inert).toBe(true);

    framePort.postMessage(JSON.stringify({ type: "closed" }));
    await settle();

    expect(frame()?.style.display).toBe("none");
    expect(other.inert).toBeFalsy();
  });

  it("falls back to the same teardown if the frame never reports closed", async () => {
    const other = document.createElement("div");
    document.body.appendChild(other);

    const { sideCart } = await loadSideCart();
    sideCart.show();
    const framePort = connectFrame();
    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 0 }));
    await settle();

    sideCart.hide();
    expect(frame()?.style.display).toBe("block");

    // No `closed` ever arrives. This wait must stay above CLOSE_FALLBACK_MS
    // in side-cart.ts (currently 1000ms).
    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(frame()?.style.display).toBe("none");
    expect(other.inert).toBeFalsy();
  });

  it("show() during a pending close cancels the teardown and leaves the drawer visible", async () => {
    const other = document.createElement("div");
    document.body.appendChild(other);

    const { sideCart } = await loadSideCart();
    sideCart.show();
    const framePort = connectFrame();
    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 0 }));
    await settle();

    sideCart.hide();
    expect(sideCart.open).toBe(false);

    sideCart.show();
    expect(sideCart.open).toBe(true);
    expect(frame()?.style.display).toBe("block");
    expect(other.inert).toBe(true);

    // The cancelled close's own `closed` must not hide the drawer or release
    // inert out from under the shopper now looking at it again.
    framePort.postMessage(JSON.stringify({ type: "closed" }));
    await settle();

    expect(frame()?.style.display).toBe("block");
    expect(other.inert).toBe(true);
  });

  it("ignores a stray closed message when no close is pending", async () => {
    const other = document.createElement("div");
    document.body.appendChild(other);

    const { sideCart } = await loadSideCart();
    sideCart.show();
    const framePort = connectFrame();
    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 0 }));
    await settle();

    // Nothing asked this frame to close.
    framePort.postMessage(JSON.stringify({ type: "closed" }));
    await settle();

    expect(sideCart.open).toBe(true);
    expect(frame()?.style.display).toBe("block");
    expect(other.inert).toBe(true);
  });

  it("re-reads the cache when the store domain changes after the first read", async () => {
    const { client, sideCart } = await loadSideCart();
    // The first read resolves against `demo.foxycart.test` and finds nothing.
    expect(sideCart.itemCount).toBeNull();

    localStorage.setItem(
      "foxy.side-cart.https://other.foxycart.test",
      JSON.stringify({ sessionId: "s9", itemCount: 7 }),
    );
    // `hydrateJson` does this too, so it is not an exotic sequence.
    client.setStoreDomain("other.foxycart.test");

    expect(sideCart.itemCount).toBe(7);
    sideCart.mount();
    expect(frame()?.src).toBe("https://other.foxycart.test/cart?session_id=s9");
  });

  it("dispatches itemcountchange with corrected: true for a first report that changes the count", async () => {
    localStorage.setItem(
      `foxy.side-cart.${STORE_ORIGIN}`,
      JSON.stringify({ sessionId: "s1", itemCount: 4 }),
    );

    const { sideCart } = await loadSideCart();
    const onItemCountChange = vi.fn();
    sideCart.addEventListener("itemcountchange", onItemCountChange);
    sideCart.mount();
    const framePort = connectFrame();

    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 2 }));
    await settle();

    // The cache said 4 and the truth is 2. The shopper did not cause that,
    // but the badge still has to stop reading the stale 4 -- only the
    // announcement (`corrected: true`) says a screen reader should stay quiet.
    expect(sideCart.itemCount).toBe(2);
    expect(onItemCountChange).toHaveBeenCalledTimes(1);
    expect(onItemCountChange.mock.calls[0][0].detail).toEqual({ corrected: true });
  });

  it("dispatches itemcountchange with corrected: false for a later report on the same connection", async () => {
    const { sideCart } = await loadSideCart();
    const onItemCountChange = vi.fn();
    sideCart.addEventListener("itemcountchange", onItemCountChange);
    sideCart.mount();
    const framePort = connectFrame();

    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 2 }));
    await settle();
    framePort.postMessage(
      JSON.stringify({ type: "state", sessionId: "s1", itemCount: 3, total: 900 }),
    );
    await settle();

    expect(sideCart.itemCount).toBe(3);
    expect(onItemCountChange).toHaveBeenCalledTimes(2);
    expect(onItemCountChange.mock.calls[1][0].detail).toEqual({ corrected: false });
  });

  it("dispatches nothing when a report does not change the count", async () => {
    localStorage.setItem(
      `foxy.side-cart.${STORE_ORIGIN}`,
      JSON.stringify({ sessionId: "s1", itemCount: 2 }),
    );

    const { sideCart } = await loadSideCart();
    const onItemCountChange = vi.fn();
    sideCart.addEventListener("itemcountchange", onItemCountChange);
    sideCart.mount();
    const framePort = connectFrame();

    // The cache already said 2, and the frame's first report confirms 2 --
    // no change at all, corrected or otherwise, so nothing should fire.
    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 2 }));
    await settle();

    expect(sideCart.itemCount).toBe(2);
    expect(onItemCountChange).not.toHaveBeenCalled();
  });

  it("makes the next first report corrected again after a fresh connect", async () => {
    const { sideCart } = await loadSideCart();
    const onItemCountChange = vi.fn();
    sideCart.addEventListener("itemcountchange", onItemCountChange);
    sideCart.mount();
    const firstPort = connectFrame();

    firstPort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 2 }));
    await settle();
    firstPort.postMessage(
      JSON.stringify({ type: "state", sessionId: "s1", itemCount: 3, total: 900 }),
    );
    await settle();

    // A same-frame navigation reconnects without going through mount() --
    // `connectFrame()` re-announces on the already-mounted frame, which is
    // what the channel's own `onConnect` (and the reset it triggers) exists
    // for.
    onItemCountChange.mockClear();
    const secondPort = connectFrame();
    secondPort.postMessage(JSON.stringify({ type: "ready", sessionId: "s1", itemCount: 5 }));
    await settle();

    expect(sideCart.itemCount).toBe(5);
    expect(onItemCountChange).toHaveBeenCalledTimes(1);
    expect(onItemCountChange.mock.calls[0][0].detail).toEqual({ corrected: true });
  });

  it("forgets the frame's count on unmount", async () => {
    const { client, sideCart } = await loadSideCart();
    await client.hydrateJson({
      items: [{ quantity: 1 }, { quantity: 1 }, { quantity: 1 }],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    sideCart.mount();
    const framePort = connectFrame();
    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s4", itemCount: 1 }));
    await settle();
    expect(sideCart.itemCount).toBe(1);

    sideCart.unmount();

    expect(sideCart.itemCount).toBe(3);
  });

  it("re-seeds the announced baseline on unmount", async () => {
    const { client, sideCart } = await loadSideCart();
    await client.hydrateJson({
      items: [{ quantity: 1 }, { quantity: 1 }, { quantity: 1 }],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    sideCart.mount();
    const framePort = connectFrame();
    // This is the first report on the connection, so it does dispatch (with
    // `corrected: true`) -- but no listener is attached yet to observe it.
    // It still leaves the baseline at 1, which is what this test pins.
    framePort.postMessage(JSON.stringify({ type: "ready", sessionId: "s5", itemCount: 1 }));
    await settle();
    sideCart.unmount();

    const onItemCountChange = vi.fn();
    sideCart.addEventListener("itemcountchange", onItemCountChange);
    // The count is back to the client's 3 and has not moved since. A baseline
    // left at the dead frame's 1 would announce a change nobody made.
    client.dispatchEvent(new Event("update"));

    expect(onItemCountChange).not.toHaveBeenCalled();
  });

  it("routes the frame's error message into the client's messages", async () => {
    const { client, sideCart } = await loadSideCart();
    await client.hydrateJson({
      items: [],
      messages: [],
      store: { domain: null },
    } as unknown as APIJson);

    sideCart.mount();
    const framePort = connectFrame();
    framePort.postMessage(
      JSON.stringify({ type: "error", message: "the cart could not be loaded" }),
    );
    await settle();

    expect(client.json?.messages).toContainEqual({
      context: "side-cart",
      message: "the cart could not be loaded",
      level: "error",
    });
  });

  it("rejects rather than throwing when invoke cannot resolve a store origin", async () => {
    const { sideCart } = await loadSideCartWithoutStoreDomain();
    let settled: Promise<void> | undefined;

    // `API.ts` does `void transport.invoke(...).catch(...)`, which cannot
    // catch a synchronous throw -- it would land in merchant code instead.
    expect(() => {
      settled = sideCart.invoke("clearCart", []);
    }).not.toThrow();

    await expect(settled).rejects.toThrow(/does not know which store/);
  });

  it("is still mountable after an append that threw", async () => {
    const { sideCart } = await loadSideCart();
    const appendChild = vi
      .spyOn(document.body, "appendChild")
      .mockImplementationOnce(() => {
        throw new Error("append blocked");
      });

    expect(() => sideCart.mount()).toThrow("append blocked");
    appendChild.mockRestore();

    sideCart.mount();

    expect(frame()).not.toBeNull();
  });
});
