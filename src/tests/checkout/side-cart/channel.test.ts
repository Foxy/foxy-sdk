/** @vitest-environment jsdom */
// src/tests/checkout/side-cart/channel.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { SideCartHostChannel } from "../../../checkout/side-cart/channel";

const ORIGIN = "https://demo.foxycart.test";

function createChannel(overrides: { expectedOrigin?: string } = {}) {
  const onMessage = vi.fn();
  const channel = new SideCartHostChannel({
    expectedSource: () => window,
    expectedOrigin: overrides.expectedOrigin ?? ORIGIN,
    onMessage,
  });

  return { channel, onMessage };
}

let openChannels: SideCartHostChannel[] = [];

afterEach(() => {
  openChannels.forEach((channel) => channel.destroy());
  openChannels = [];
});

describe("checkout/side-cart/channel", () => {
  it("answers a valid announcement by transferring a port", () => {
    const { channel } = createChannel();
    openChannels.push(channel);
    const postMessage = vi.spyOn(window, "postMessage");

    dispatchEvent(
      new MessageEvent("message", {
        data: { type: "awaiting-connect" },
        origin: ORIGIN,
        source: window,
      }),
    );

    expect(postMessage).toHaveBeenCalledTimes(1);
    const [message, targetOrigin, transfer] = postMessage.mock.calls[0];
    expect(message).toEqual({ type: "connect" });
    expect(targetOrigin).toBe(ORIGIN);
    expect((transfer as Transferable[])[0]).toBeInstanceOf(MessagePort);
    postMessage.mockRestore();
  });

  it("ignores an announcement from another origin", () => {
    const { channel } = createChannel({ expectedOrigin: "https://real.foxycart.test" });
    openChannels.push(channel);
    const postMessage = vi.spyOn(window, "postMessage");

    dispatchEvent(
      new MessageEvent("message", {
        data: { type: "awaiting-connect" },
        origin: "https://attacker.example",
        source: window,
      }),
    );

    expect(postMessage).not.toHaveBeenCalled();
    postMessage.mockRestore();
  });

  it("queues an invoke made before connect and resolves it on a result", async () => {
    const { channel } = createChannel();
    openChannels.push(channel);
    const pair = new MessageChannel();
    const received: unknown[] = [];

    pair.port1.onmessage = (event) => {
      received.push(JSON.parse(event.data as string));
      pair.port1.postMessage(JSON.stringify({ type: "result", id: 1, error: null }));
    };
    pair.port1.start();

    const settled = channel.invoke("removeItem", [{ id: 9 }]);
    channel.connect(pair.port2);

    await expect(settled).resolves.toBeUndefined();
    expect(received).toEqual([
      { type: "invoke", id: 1, method: "removeItem", params: [{ id: 9 }] },
    ]);
  });

  it("rejects an invoke whose result carries an error", async () => {
    const { channel } = createChannel();
    openChannels.push(channel);
    const pair = new MessageChannel();

    pair.port1.onmessage = () => {
      pair.port1.postMessage(JSON.stringify({ type: "result", id: 1, error: "nope" }));
    };
    pair.port1.start();
    channel.connect(pair.port2);

    await expect(channel.invoke("clearCart", [])).rejects.toThrow("nope");
  });

  it("hands frame-initiated messages to onMessage", async () => {
    const { channel, onMessage } = createChannel();
    openChannels.push(channel);
    const pair = new MessageChannel();

    channel.connect(pair.port2);
    pair.port1.postMessage(JSON.stringify({ type: "close" }));
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onMessage).toHaveBeenCalledWith({ type: "close" });
  });
});
