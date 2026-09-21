/** @vitest-environment jsdom */
// src/tests/checkout/side-cart/side-cart.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const STORE_ORIGIN = "https://demo.foxycart.test";

async function loadSideCart() {
  vi.resetModules();
  const { client } = await import("../../../checkout/client");
  client.setStoreDomain("demo.foxycart.test");
  const module = await import("../../../checkout/side-cart");

  return { client, sideCart: module.sideCart };
}

function frame(): HTMLIFrameElement | null {
  return document.querySelector("iframe[data-foxy-side-cart]");
}

describe("checkout/side-cart", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
  });

  it("makes no iframe and no request until something asks for one", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await loadSideCart();

    expect(frame()).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
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
});
