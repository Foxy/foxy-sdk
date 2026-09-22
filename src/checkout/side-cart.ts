// src/checkout/side-cart.ts
import type { FrameToHostMessage, SideCartInvokeMethod } from "./side-cart/protocol";
import { client } from "./client";
import { readCachedState, writeCachedState } from "./side-cart/session-cache";
import { resolveBaseUrlFromStoreDomain } from "./API";
import { SideCartHostChannel } from "./side-cart/channel";

const NO_STORE_ORIGIN =
  "The sidecart does not know which store to load. Import it as " +
  '"checkout/side-cart.js?store=example.foxycart.com", or set the domain on the ' +
  'client first (that is what "checkout/loader.js?store=..." does).';

/**
 * Safety net, not the expected path. The frame reports `closed` once its own
 * exit animation finishes, and that is what normally clears the pending
 * teardown. A frame that is unresponsive, gone, or never connected would
 * otherwise leave the drawer visible and the page behind it inert forever.
 * 1000ms comfortably exceeds a normal close transition (well under 500ms
 * even with margin for a slower device) without leaving a dead overlay on
 * screen for long if something is actually wrong.
 */
const CLOSE_FALLBACK_MS = 1000;

class SideCart extends EventTarget {
  #frame: HTMLIFrameElement | null = null;
  #channel: SideCartHostChannel | null = null;
  #open = false;
  #inerted: HTMLElement[] = [];
  /** What the iframe has reported this session. Separate from the persisted
   * cache: `null` means the iframe has not reported yet, not that the cart is
   * empty. */
  #reportedItemCount: number | null = null;
  #lastAnnouncedCount: number | null = this.itemCount;
  /** Whether the frame has said `ready` on the CURRENT connection. Reset by
   * the channel's `onConnect`, because a same-frame navigation reconnects
   * without going through `mount()`. */
  #frameReady = false;
  /** Whether the next `ready`/`state` is the first one on this connection.
   * That report is the cache-to-authoritative correction, which the design
   * forbids announcing: the shopper did not cause it. */
  #firstReportPending = true;
  /**
   * Set by `hide()` while waiting for the frame to report `closed` (or for
   * `CLOSE_FALLBACK_MS` to elapse). `null` means no close is pending. This is
   * the one flag that says whether a `closed` message is expected right now,
   * so a stray one -- arriving with nothing pending -- is ignored rather than
   * tearing down a frame that was never told to close.
   */
  #pendingCloseTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * The frame runs its own Escape handling and answers with `close`, but it
   * only sees Escape while focus is inside it. This covers what it cannot: a
   * frame that never connected, and focus left on the host page.
   */
  #onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") this.hide();
  };

  constructor() {
    super();
    // The client fetches the cart JSON on a merchant page regardless of the
    // sidecart, so its item count is live the moment it resolves. But `client`
    // fires "update" for any json change -- a coupon, an address edit, a
    // payment SDK resolving -- not only a count change, so this has to be
    // gated the same way `#handle` gates the iframe's reports.
    client.addEventListener("update", () => {
      this.#announceIfCountChanged();
    });
  }

  /**
   * The store the iframe is loaded from, resolved on first use rather than at
   * import: a merchant may import this module before `checkout/loader.js` has
   * set the store domain.
   *
   * There are exactly two sources, both explicit: `client.storeUrl` and this
   * module's own `?store=`. There is deliberately no `location.hostname`
   * fallback -- `checkout/loader.ts` can afford one because a store-hosted
   * page's hostname IS the store, but this module runs on the merchant's
   * page, where by definition it is not. Falling back there would frame the
   * merchant's own site and then hand a cart-mutation port to it.
   *
   * The trailing slash goes. `resolveBaseUrlFromStoreDomain` returns a base
   * URL (`https://store.example/`), and this needs an origin: it is compared
   * against `event.origin`, which never has one, and it is concatenated with
   * `/cart`.
   */
  #origin(): string {
    const fromScript = new URL(import.meta.url).searchParams.get("store");
    const baseUrl =
      client.storeUrl ??
      (fromScript === null ? null : resolveBaseUrlFromStoreDomain(fromScript));

    if (baseUrl === null) throw new Error(NO_STORE_ORIGIN);

    const origin = baseUrl.replace(/\/$/, "");

    // The sidecart frames the store OVER the merchant's site, so resolving to
    // this page's own origin means no store was supplied at all. It reaches
    // here through `client.storeUrl`, where it looks explicit:
    // `checkout/loader.ts` sets the domain from its own `location.hostname`
    // fallback when it is loaded without `?store=`. Framing that would load
    // the merchant's own 404 at full viewport and then transfer a
    // cart-mutation port to a merchant-controlled document. A store on a
    // subdomain of the same site is a different origin and still works.
    if (origin === location.origin) throw new Error(NO_STORE_ORIGIN);

    return origin;
  }

  /**
   * `#origin()`, but tolerant of it being unresolvable: reading or writing
   * the cache is opportunistic, never worth crashing over -- importing this
   * module (and seeding `#lastAnnouncedCount` below) must never throw just
   * because nobody has set a store domain yet. `mount()` is the one place a
   * URL is actually required, and it calls `#origin()` directly, so a real
   * misconfiguration still refuses there.
   */
  #tryOrigin(): string | null {
    try {
      return this.#origin();
    } catch {
      return null;
    }
  }

  /**
   * Deliberately not memoized. The origin can change under this object -- a
   * `setStoreDomain` after the first read, which `hydrateJson` also triggers
   * -- and a memo filled against whichever origin resolved first would pin
   * the shopper's session to it forever. A `localStorage` read is cheap.
   */
  #state(): ReturnType<typeof readCachedState> {
    const origin = this.#tryOrigin();
    return origin === null ? null : readCachedState(origin);
  }

  get open(): boolean {
    return this.#open;
  }

  /**
   * `null` means "not known yet", which is not the same as an empty cart.
   * Most-recent-wins: what the iframe reported this session, then the
   * client's own json, then the persisted cache. A delegated mutation never
   * refreshes `client.json` -- it forwards to the transport and returns --
   * so once the iframe has reported, its number is the only one still being
   * kept live and must outrank the client's page-load snapshot.
   *
   * This is a count of units, not line items -- the cart page inside the
   * iframe (and its `ready`/`state` reports) shows a total quantity, e.g. a
   * cart holding 3 of one product reads "Your cart - 3 items", not 1. The
   * middle tier has to use the same rule or the badge would read 1 until the
   * frame connects and then silently jump to 3. `Math.max(0, ...)` clamps a
   * negative quantity to 0 rather than letting it subtract from the total.
   */
  get itemCount(): number | null {
    return (
      this.#reportedItemCount ??
      client.json?.items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0) ??
      this.#state()?.itemCount ??
      null
    );
  }

  mount(): void {
    if (this.#frame) return;

    // Resolved first: it is the one step that can refuse, and it has to refuse
    // before anything is created or appended.
    const origin = this.#origin();
    const sessionId = this.#state()?.sessionId;
    const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
    const frame = document.createElement("iframe");

    frame.dataset.foxySideCart = "";
    frame.title = "Cart";
    frame.src = `${origin}/cart${query}`;
    // `background:transparent` is belt and braces: an iframe is normally
    // transparent when the embedded document is, but user agents have
    // historically filled the canvas, and the real bug this guards against
    // (the cart page painting an opaque body background, composited through
    // the frame) is fixed on the document side, in foxy-checkout.
    frame.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483647;" +
      "display:none;background:transparent";

    document.body.appendChild(frame);
    // Both assignments happen only once the frame is really in the document.
    // Assigning `#frame` before a throwing `appendChild` wedged this object
    // forever, since `mount()` early-returns on `#frame`; constructing the
    // channel before it would leave its window listener behind.
    this.#frame = frame;
    this.#channel = new SideCartHostChannel({
      expectedSource: () => this.#frame?.contentWindow ?? null,
      expectedOrigin: origin,
      onMessage: (message) => this.#handle(message),
      onConnect: () => {
        this.#frameReady = false;
        this.#firstReportPending = true;
      },
    });
  }

  unmount(): void {
    this.hide();
    // Do not wait for `closed` here -- the frame is being torn down
    // regardless, so there is nothing left to animate. This both performs
    // the teardown `hide()` may have just deferred and clears its fallback
    // timer, so that timer cannot fire later against a frame this method is
    // about to remove (or a different one a later `mount()` creates).
    this.#finishHide();
    this.#channel?.destroy();
    this.#channel = null;
    this.#frame?.remove();
    this.#frame = null;
    this.#frameReady = false;
    this.#firstReportPending = true;
    // The next connect's first report is by definition a fresh correction, so
    // both the reported count and the announced baseline go back to what they
    // were at construction rather than staying at a dead frame's last word.
    this.#reportedItemCount = null;
    this.#lastAnnouncedCount = this.itemCount;
  }

  reload(): void {
    const wasOpen = this.#open;
    this.unmount();
    this.mount();
    if (wasOpen) this.show();
  }

  show(): void {
    this.mount();
    // A close that was mid-animation (frame visible, page still inert, a
    // fallback timer ticking) is cancelled rather than let run to completion
    // behind the shopper's back -- they asked to see the drawer again, so it
    // must stay visible and the page behind it must stay inert.
    this.#clearPendingClose();
    if (this.#open) return;
    this.#open = true;
    if (this.#frame) this.#frame.style.display = "block";
    this.#channel?.post({ type: "show" });
    // `inert` waits for the frame's own `ready`. A frame that never connects
    // -- store outage, a frame-src CSP on the merchant's page, a tracking
    // blocker -- renders no close button of its own, and an inert page behind
    // it would leave the shopper nothing but a reload.
    if (this.#frameReady) this.#setPageInert(true);
    document.addEventListener("keydown", this.#onKeyDown);
    this.dispatchEvent(new Event("open"));
  }

  hide(): void {
    if (!this.#open) return;
    this.#open = false;
    document.removeEventListener("keydown", this.#onKeyDown);
    this.#channel?.post({ type: "hide" });
    this.dispatchEvent(new Event("close"));

    // The frame owns the close animation -- it is the only thing that knows
    // when its exit transition has actually finished -- so the iframe stays
    // visible and the page behind it stays inert (still covered by a visible
    // overlay, so it must not become clickable early) until the frame
    // reports `closed`. `CLOSE_FALLBACK_MS` covers a frame that never does.
    this.#clearPendingClose();
    this.#pendingCloseTimer = setTimeout(() => this.#finishHide(), CLOSE_FALLBACK_MS);
  }

  /** The teardown `hide()` defers: actually hiding the iframe and releasing
   * `inert`. Runs once the frame reports `closed`, once the fallback timer
   * elapses, or immediately from `unmount()`, which has no animation left to
   * wait for. Safe to call when nothing is pending -- every step is a no-op
   * in that case. */
  #finishHide(): void {
    this.#clearPendingClose();
    if (this.#frame) this.#frame.style.display = "none";
    this.#setPageInert(false);
  }

  #clearPendingClose(): void {
    if (this.#pendingCloseTimer === null) return;
    clearTimeout(this.#pendingCloseTimer);
    this.#pendingCloseTimer = null;
  }

  /** Called by `client` through the transport hook. */
  async invoke(method: SideCartInvokeMethod, params: unknown[]): Promise<void> {
    // `async` is load-bearing. `mount()` throws synchronously when no store
    // origin is set, and `API.ts`'s `void transport.invoke(...).catch(...)`
    // cannot catch a synchronous throw: it would escape into merchant code
    // instead of the addErrorMessage + onError channel that is the only
    // failure path a merchant page has.
    this.mount();
    const channel = this.#channel;
    if (!channel) throw new Error("The sidecart is not mounted.");

    return channel.invoke(method, params);
  }

  #handle(message: FrameToHostMessage): void {
    if (message.type === "close") {
      this.hide();
      return;
    }

    if (message.type === "closed") {
      // Ignore a stray report: nothing asked this frame to close, so there is
      // no deferred teardown waiting on it.
      if (this.#pendingCloseTimer === null) return;
      this.#finishHide();
      return;
    }

    if (message.type === "error") {
      // The frame's only unsolicited error channel, routed where a rejected
      // delegated mutation goes: the checkout json's messages when there is
      // one, and the client's own error hook either way.
      client.reportSideCartError(new Error(message.message));
      return;
    }

    if (message.type === "ready" || message.type === "state") {
      if (message.type === "ready") this.#frameReady = true;
      // The frame is alive and drawing its own close affordance, so the page
      // behind it can finally go inert.
      if (this.#frameReady && this.#open) this.#setPageInert(true);

      this.#reportedItemCount = message.itemCount;
      const origin = this.#tryOrigin();

      if (origin !== null) {
        writeCachedState(origin, {
          sessionId: message.sessionId,
          itemCount: message.itemCount,
        });
      }

      // The first report on a connection corrects the cache to the truth; it
      // is not a change the shopper made. That distinction used to suppress
      // the event outright, but the event is also the trigger's only signal
      // that the count changed at all -- suppressing it left the badge and
      // its aria-label stuck on the stale cached number until some *other*
      // change happened to fire it. The correction must be silent, not
      // invisible: it still dispatches, carrying `corrected: true` so a
      // consumer can render always and announce selectively.
      const corrected = this.#firstReportPending;
      this.#firstReportPending = false;
      this.#announceIfCountChanged(corrected);
    }
  }

  /**
   * The one place "itemcountchange" gets dispatched, so the iframe's reports
   * and the client's own json can't drift into firing on different rules.
   * `client` fires "update" on any json change, not only a count change, and
   * an aria-live region downstream must not announce a correction that did
   * not happen -- which is what `corrected` is for: `true` only for the
   * first report after a connect (a cache-to-authoritative correction the
   * shopper did not cause), `false` for every other source of a change
   * (a later frame report, or the client's own json).
   */
  #announceIfCountChanged(corrected = false): void {
    const count = this.itemCount;
    if (count === this.#lastAnnouncedCount) return;
    this.#lastAnnouncedCount = count;
    this.dispatchEvent(new CustomEvent("itemcountchange", { detail: { corrected } }));
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
