// src/checkout/side-cart/channel.ts
import type {
  FrameToHostMessage,
  HostToFrameMessage,
  SideCartInvokeMethod,
} from "./protocol";
import { isAnnouncement, parseFrameToHost, SIDE_CART_CONNECT } from "./protocol";

type Pending = { resolve: () => void; reject: (error: Error) => void };

export type SideCartHostChannelParams = {
  /**
   * Read lazily rather than captured: the iframe is created and destroyed by
   * the sidecart, so `contentWindow` changes identity under the channel.
   */
  expectedSource: () => MessageEventSource | null;
  expectedOrigin: string;
  onMessage: (message: FrameToHostMessage) => void;
};

export class SideCartHostChannel {
  #params: SideCartHostChannelParams;
  #port: MessagePort | null = null;
  #nextId = 1;
  #pending = new Map<number, Pending>();
  #queue: HostToFrameMessage[] = [];

  #onWindowMessage = (event: MessageEvent<unknown>): void => {
    if (!isAnnouncement(event.data)) return;
    // Both checks matter. Source alone would let any document the merchant
    // frames answer for the cart; origin alone would let a same-origin
    // document do it. The frame cannot make this check in reverse -- it does
    // not know the merchant's origin -- which is why it announces with '*'.
    if (event.source === null) return;
    if (event.source !== this.#params.expectedSource()) return;
    if (event.origin !== this.#params.expectedOrigin) return;

    const pair = new MessageChannel();
    (event.source as Window).postMessage(SIDE_CART_CONNECT, this.#params.expectedOrigin, [
      pair.port2,
    ]);
    this.connect(pair.port1);
  };

  constructor(params: SideCartHostChannelParams) {
    this.#params = params;
    addEventListener("message", this.#onWindowMessage);
  }

  connect(port: MessagePort): void {
    this.#port?.close();
    this.#port = port;

    port.onmessage = (event) => {
      const message = parseFrameToHost(event.data);
      if (!message) return;

      if (message.type === "result") {
        const pending = this.#pending.get(message.id);
        if (!pending) return;
        this.#pending.delete(message.id);
        if (message.error === null) pending.resolve();
        else pending.reject(new Error(message.error));
        return;
      }

      this.#params.onMessage(message);
    };

    port.start();
    const queued = this.#queue;
    this.#queue = [];
    queued.forEach((message) => this.post(message));
  }

  invoke(method: SideCartInvokeMethod, params: unknown[]): Promise<void> {
    const id = this.#nextId++;

    return new Promise<void>((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.post({ type: "invoke", id, method, params });
    });
  }

  post(message: HostToFrameMessage): void {
    if (this.#port) this.#port.postMessage(JSON.stringify(message));
    else this.#queue.push(message);
  }

  destroy(): void {
    removeEventListener("message", this.#onWindowMessage);
    this.#port?.close();
    this.#port = null;
    this.#pending.forEach((pending) => pending.reject(new Error("Sidecart closed.")));
    this.#pending.clear();
    this.#queue = [];
  }
}
