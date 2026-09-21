// src/checkout/side-cart.ts
import type { FrameToHostMessage, SideCartInvokeMethod } from "./side-cart/protocol";
import { client } from "./client";
import { readCachedState, writeCachedState } from "./side-cart/session-cache";
import { resolveBaseUrlFromStoreDomain } from "./API";
import { SideCartHostChannel } from "./side-cart/channel";

class SideCart extends EventTarget {
  #frame: HTMLIFrameElement | null = null;
  #channel: SideCartHostChannel | null = null;
  #open = false;
  #inerted: HTMLElement[] = [];
  #cached: ReturnType<typeof readCachedState> | undefined = undefined;

  /**
   * The store the iframe is loaded from, resolved on first use rather than at
   * import: a merchant may import this module before `checkout/loader.js` has
   * set the store domain. `client` is the only place the domain is resolved --
   * on a merchant page nobody has called hydrateJson, so there is no store
   * JSON to read it from -- with the script's own `?store=` as the fallback,
   * the same one `src/checkout/loader.ts` reads.
   *
   * The trailing slash goes. `resolveBaseUrlFromStoreDomain` returns a base
   * URL (`API.ts:107` — `https://store.example/`), and this needs an origin:
   * it is compared against `event.origin`, which never has one, and it is
   * concatenated with `/cart`.
   */
  #origin(): string {
    const fromScript = new URL(import.meta.url).searchParams.get("store");
    const baseUrl =
      client.storeUrl ??
      resolveBaseUrlFromStoreDomain(fromScript ?? location.hostname);

    return baseUrl.replace(/\/$/, "");
  }

  #state(): ReturnType<typeof readCachedState> {
    if (this.#cached === undefined) this.#cached = readCachedState(this.#origin());
    return this.#cached;
  }

  get open(): boolean {
    return this.#open;
  }

  /** `null` means "not known yet", which is not the same as an empty cart. */
  get itemCount(): number | null {
    return this.#state()?.itemCount ?? null;
  }

  mount(): void {
    if (this.#frame) return;

    const frame = document.createElement("iframe");
    const sessionId = this.#state()?.sessionId;
    const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";

    frame.dataset.foxySideCart = "";
    frame.title = "Cart";
    frame.src = `${this.#origin()}/cart${query}`;
    frame.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483647;display:none";

    this.#channel = new SideCartHostChannel({
      expectedSource: () => this.#frame?.contentWindow ?? null,
      expectedOrigin: this.#origin(),
      onMessage: (message) => this.#handle(message),
    });

    this.#frame = frame;
    document.body.appendChild(frame);
  }

  unmount(): void {
    this.hide();
    this.#channel?.destroy();
    this.#channel = null;
    this.#frame?.remove();
    this.#frame = null;
  }

  reload(): void {
    const wasOpen = this.#open;
    this.unmount();
    this.mount();
    if (wasOpen) this.show();
  }

  show(): void {
    this.mount();
    if (this.#open) return;
    this.#open = true;
    if (this.#frame) this.#frame.style.display = "block";
    this.#channel?.post({ type: "show" });
    this.#setPageInert(true);
    this.dispatchEvent(new Event("open"));
  }

  hide(): void {
    if (!this.#open) return;
    this.#open = false;
    if (this.#frame) this.#frame.style.display = "none";
    this.#channel?.post({ type: "hide" });
    this.#setPageInert(false);
    this.dispatchEvent(new Event("close"));
  }

  /** Called by `client` through the transport hook. */
  invoke(method: SideCartInvokeMethod, params: unknown[]): Promise<void> {
    this.mount();
    const channel = this.#channel;
    if (!channel) return Promise.reject(new Error("The sidecart is not mounted."));

    return channel.invoke(method, params);
  }

  #handle(message: FrameToHostMessage): void {
    if (message.type === "close") {
      this.hide();
      return;
    }

    if (message.type === "ready" || message.type === "state") {
      const changed = this.#state()?.itemCount !== message.itemCount;
      this.#cached = { sessionId: message.sessionId, itemCount: message.itemCount };
      writeCachedState(this.#origin(), this.#cached);
      if (changed) this.dispatchEvent(new Event("itemcountchange"));
    }
  }

  /**
   * The drawer's focus trap lives in the iframe's document and keeps Tab
   * cycling inside it. It cannot stop the browser moving focus out to the host
   * page, so the host takes the page behind out of the tab order itself.
   */
  #setPageInert(inert: boolean): void {
    // Not re-entrant on purpose. A second show() while already inerted would
    // capture the elements it inerted itself, and the next hide() would clear
    // flags the merchant's own modal had set.
    if (inert && this.#inerted.length) return;

    if (!inert) {
      this.#inerted.forEach((element) => (element.inert = false));
      this.#inerted = [];
      return;
    }

    this.#inerted = Array.from(document.body.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child !== this.#frame && !child.inert,
    );

    this.#inerted.forEach((element) => (element.inert = true));
  }
}

export const sideCart = new SideCart();

// Importing this module is what makes `client` a sidecart client. The store's
// own cart and checkout pages never import it, so their client keeps talking
// to the store directly.
client.setSideCartTransport(sideCart);
