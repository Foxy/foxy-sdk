/** @vitest-environment jsdom */
/** @vitest-environment-options { "url": "https://shop.example.com/" } */
// src/tests/checkout/side-cart/origin.test.ts
//
// This file exists for its jsdom URL. Every other sidecart test runs on
// vitest's default `http://localhost:3000/`, where a `location.hostname`
// fallback happens to throw anyway (no dot, no VITE_FOXYCART_DOMAIN) and so
// hides the real hazard. A merchant's hostname DOES have a dot: with the
// fallback in place the sidecart resolved `https://shop.example.com/cart` --
// the merchant's own 404, at full viewport -- and then transferred a
// cart-mutation port to a merchant-controlled document, because both of the
// channel's guards legitimately passed.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadSideCart(storeDomain?: string) {
  vi.resetModules();
  const { client } = await import("../../../checkout/client");
  if (storeDomain) client.setStoreDomain(storeDomain);
  const module = await import("../../../checkout/side-cart");

  return { client, sideCart: module.sideCart };
}

function frame(): HTMLIFrameElement | null {
  return document.querySelector("iframe[data-foxy-side-cart]");
}

describe("checkout/side-cart store origin", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network disabled in tests"));
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    vi.restoreAllMocks();
  });

  it("runs on a merchant hostname that would resolve as a store domain", () => {
    // Guards the fixture itself: if this ever stopped being true the test
    // below would pass for the wrong reason.
    expect(location.hostname).toBe("shop.example.com");
  });

  it("refuses to mount rather than framing the merchant's own site", async () => {
    const { sideCart } = await loadSideCart();

    expect(() => sideCart.mount()).toThrow(/does not know which store/);
    expect(frame()).toBeNull();
  });

  it("refuses a store origin that is this page's own origin", async () => {
    // `checkout/loader.ts` falls back to `location.hostname` when it is loaded
    // without `?store=`. That fallback is right on a store-hosted page and
    // wrong here, and it reaches the sidecart through `client.storeUrl`, where
    // it looks like an explicit store.
    const { sideCart } = await loadSideCart("shop.example.com");

    expect(() => sideCart.mount()).toThrow(/does not know which store/);
    expect(frame()).toBeNull();
  });

  it("mounts the store once the client has an explicit domain", async () => {
    const { sideCart } = await loadSideCart("demo.foxycart.test");

    sideCart.mount();

    expect(frame()?.src).toBe("https://demo.foxycart.test/cart");
  });

  it("refuses an uppercase or :443 form of the page's own host, not just the exact match", async () => {
    const { sideCart } = await loadSideCart("SHOP.EXAMPLE.COM:443");

    expect(() => sideCart.mount()).toThrow(/does not know which store/);
    expect(frame()).toBeNull();
  });
});
