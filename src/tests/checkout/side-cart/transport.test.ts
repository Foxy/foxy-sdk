/** @vitest-environment jsdom */
// src/tests/checkout/side-cart/transport.test.ts
import { describe, expect, it, vi } from "vitest";
import { API } from "../../../checkout/API";

describe("checkout/API sidecart transport", () => {
  it("delegates a mutation instead of calling the store", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const invoke = vi.fn().mockResolvedValue(undefined);
    const api = new API({ storeDomain: "demo.foxycart.test" });

    api.setSideCartTransport({ invoke });
    api.updateItemQuantity({ id: 9, quantity: 2 });

    expect(invoke).toHaveBeenCalledWith("updateItemQuantity", [{ id: 9, quantity: 2 }]);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("delegates even though the host holds no checkout json", () => {
    // This is the whole point. On a merchant page nobody has called
    // hydrateJson, so every mutation returns early at `if (!this.json)` and
    // silently does nothing. The delegation check has to come first.
    const invoke = vi.fn().mockResolvedValue(undefined);
    const api = new API({ storeDomain: "demo.foxycart.test" });

    api.setSideCartTransport({ invoke });
    expect(api.json).toBeNull();
    api.clearCart();

    expect(invoke).toHaveBeenCalledWith("clearCart", []);
  });

  it("goes back to talking to the store when the transport is removed", () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const api = new API({ storeDomain: "demo.foxycart.test" });

    api.setSideCartTransport({ invoke });
    api.setSideCartTransport(null);
    api.clearCart();

    expect(invoke).not.toHaveBeenCalled();
  });

  it("reports a rejected invoke through onError even with no checkout json", async () => {
    const failure = new Error("frame is gone");
    const invoke = vi.fn().mockRejectedValue(failure);
    const onError = vi.fn();
    const api = new API({ storeDomain: "demo.foxycart.test", onError });

    api.setSideCartTransport({ invoke });
    expect(api.json).toBeNull();
    api.clearCart();

    await Promise.resolve();
    await Promise.resolve();

    expect(onError).toHaveBeenCalledWith(failure);
  });
});
