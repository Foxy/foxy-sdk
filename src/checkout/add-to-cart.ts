// src/checkout/add-to-cart.ts
import { client } from "./client";
import { clearSession, ensureSession, getSession } from "./add-to-cart/session";
import { resolveHostStoreOrigin } from "./side-cart/origin";

/** `detail` of the cancelable, bubbling `foxy:add-to-cart` event. */
export type AddToCartDetail = {
  url: URL;
  params: [string, string][];
  sessionId: string | null;
};

const SESSION_PARAM = "session_id";

/**
 * The `SubmitEvent` this module let through with a cached session -- the
 * event, not the form: `onFormData` needs its `eventPhase` and
 * `defaultPrevented` to tell the form's own submission from a merchant's own
 * `new FormData(form)`, which must never get `session_id` (see `onFormData`).
 * Cleared on the next task, whether or not the submission ran.
 */
let pendingSubmit: SubmitEvent | null = null;

/** Set while this module re-submits a form, so `onSubmit` lets it through. */
let resubmitting: HTMLFormElement | null = null;

function storeOrigin(): string | null {
  try {
    return resolveHostStoreOrigin(import.meta.url);
  } catch {
    return null;
  }
}

function toCartUrl(href: string, origin: string): URL | null {
  let url: URL;
  try {
    url = new URL(href, location.href);
  } catch {
    return null;
  }

  if (url.origin !== origin) return null;
  return url.pathname.replace(/\/+$/, "") === "/cart" ? url : null;
}

function withSession(url: URL, sessionId: string): string {
  const next = new URL(url);
  next.searchParams.set(SESSION_PARAM, sessionId);
  return next.href;
}

/**
 * These leave for checkout or another page, so they navigate even when a
 * sidecart is present. The 2.0 sidecart did the same.
 */
function leavesTheCart(params: URLSearchParams): boolean {
  return params.get("cart") === "checkout" || params.has("redirect");
}

/** False when the merchant cancelled it: custom mode. */
function announce(target: Element, detail: AddToCartDetail): boolean {
  return target.dispatchEvent(
    new CustomEvent<AddToCartDetail>("foxy:add-to-cart", {
      bubbles: true,
      cancelable: true,
      detail,
    }),
  );
}

function opensNewTab(event: MouseEvent, target: string): boolean {
  return (
    event.type === "auxclick" ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    (target !== "" && target !== "_self")
  );
}

/**
 * The only DOM write this module makes. A new-tab click cannot be replayed
 * after `preventDefault` (a popup blocker stops `window.open` after an
 * await), so the browser's own default action has to read the session from
 * the `href`. The page stays where it is, so the restore always runs.
 *
 * Never called for a `ping` link: the browser's default action sends the
 * `href` it follows to the link's ping URLs, which may not be this store, so
 * writing the session into `href` here would leak it cross-origin.
 */
function swapHref(link: HTMLAnchorElement, href: string): void {
  const original = link.getAttribute("href");
  link.setAttribute("href", href);
  setTimeout(() => {
    if (original === null) link.removeAttribute("href");
    else link.setAttribute("href", original);
  }, 0);
}

function onClick(event: MouseEvent): void {
  // `auxclick` also fires for the right button (2) and for back/forward (3,
  // 4), not just the middle button (1). A right-click must not swap the
  // `href` even for one tick: the context menu's "Copy link" can read it.
  if (event.type === "auxclick" && event.button !== 1) return;
  if (event.defaultPrevented) return;

  const origin = storeOrigin();
  if (origin === null) return;

  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(link instanceof HTMLAnchorElement)) return;

  const url = toCartUrl(link.href, origin);
  if (!url) return;

  const params = [...url.searchParams];
  const sessionId = getSession(origin);

  if (!announce(link, { url, params, sessionId })) {
    event.preventDefault();
    return;
  }

  const newTab = opensNewTab(event, link.target);
  const sideCart = client.sideCartTransport;

  if (!newTab && sideCart && !leavesTheCart(url.searchParams)) {
    event.preventDefault();
    try {
      client.addItem(params);
      sideCart.show();
    } catch (error) {
      client.reportSideCartError(error instanceof Error ? error : new Error(String(error)));
    }
    return;
  }

  if (url.searchParams.get("empty") === "reset") {
    clearSession(origin);
    // A new tab cannot wait for a new session (see `swapHref`): it resets on
    // the server, as today.
    if (newTab) return;

    // Get the new session here, so the merchant's cache holds the session
    // the item lands in and later clicks add to it. `empty` goes: the server
    // would reset again. With no session to be had, send the link as it is.
    event.preventDefault();
    void ensureSession(origin).then((id) => {
      if (!id) return location.assign(url.href);
      const next = new URL(url);
      next.searchParams.delete("empty");
      location.assign(withSession(next, id));
    });
    return;
  }

  if (url.searchParams.has(SESSION_PARAM)) return;

  if (newTab) {
    if (sessionId && !link.hasAttribute("ping")) swapHref(link, withSession(url, sessionId));
    return;
  }

  event.preventDefault();

  if (sessionId) {
    location.assign(withSession(url, sessionId));
    return;
  }

  void ensureSession(origin).then((id) => {
    location.assign(id ? withSession(url, id) : url.href);
  });
}

function actionOf(form: HTMLFormElement, submitter: HTMLElement | null): string {
  return submitter?.hasAttribute("formaction")
    ? (submitter as HTMLButtonElement | HTMLInputElement).formAction
    : form.action;
}

function targetOf(form: HTMLFormElement, submitter: HTMLElement | null): string {
  return submitter?.getAttribute("formtarget") ?? form.target;
}

/**
 * What the form sends, in order. A GET form's action query is replaced by
 * its fields; a POST form sends both. Files are dropped: an add-to-cart form
 * has none, and they cannot cross the sidecart's port.
 */
function pairsOf(form: HTMLFormElement, submitter: HTMLElement | null, url: URL): [string, string][] {
  const fields: [string, string][] = [];

  for (const [name, value] of new FormData(form)) {
    if (typeof value === "string") fields.push([name, value]);
  }

  if (
    (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) &&
    submitter.name
  ) {
    fields.push([submitter.name, submitter.value]);
  }

  const method = (submitter?.getAttribute("formmethod") ?? form.method).toLowerCase();
  return method === "get" ? fields : [...url.searchParams, ...fields];
}

function onSubmit(event: SubmitEvent): void {
  if (event.defaultPrevented) return;

  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (resubmitting === form) {
    pendingSubmit = event;
    setTimeout(() => (pendingSubmit = null), 0);
    return;
  }

  const origin = storeOrigin();
  if (origin === null) return;

  const submitter = event.submitter;
  const url = toCartUrl(actionOf(form, submitter), origin);
  if (!url) return;

  const params = pairsOf(form, submitter, url);
  const search = new URLSearchParams(params);
  const sessionId = getSession(origin);

  if (!announce(form, { url, params, sessionId })) {
    event.preventDefault();
    return;
  }

  const sideCart = client.sideCartTransport;
  const target = targetOf(form, submitter);
  const newTab = target !== "" && target !== "_self";

  if (!newTab && sideCart && !leavesTheCart(search)) {
    event.preventDefault();
    try {
      client.addItem(params);
      sideCart.show();
    } catch (error) {
      client.reportSideCartError(error instanceof Error ? error : new Error(String(error)));
    }
    return;
  }

  if (search.get("empty") === "reset") {
    clearSession(origin);
    if (newTab) return;
    // Same as a link: get the new session first. `onFormData` then adds it
    // and removes `empty`, so the server does not reset again.
    event.preventDefault();
    void ensureSession(origin).then(() => resubmit(form, submitter));
    return;
  }

  if (search.has(SESSION_PARAM)) return;

  if (sessionId || newTab) {
    pendingSubmit = event;
    setTimeout(() => (pendingSubmit = null), 0);
    return;
  }

  event.preventDefault();
  void ensureSession(origin).then(() => resubmit(form, submitter));
}

function resubmit(form: HTMLFormElement, submitter: HTMLElement | null): void {
  resubmitting = form;
  try {
    form.requestSubmit(submitter ?? undefined);
  } finally {
    resubmitting = null;
  }
}

function onFormData(event: Event): void {
  const form = event.target;
  const pending = pendingSubmit;
  if (!(form instanceof HTMLFormElement) || pending === null || pending.target !== form) return;

  // Only the form's OWN submission gets the id. The browser fires `formdata`
  // once the `submit` dispatch has fully ended and nothing cancelled it
  // (`eventPhase === NONE && !defaultPrevented`). A merchant's own
  // `new FormData(form)` -- inside a `submit` listener that runs after ours,
  // e.g. one on `window`, or a library's `document` listener added after
  // this module loads -- fires `formdata` *during* that dispatch
  // (`eventPhase !== NONE`); a `new FormData(form)` after a cancelled submit
  // still sees `defaultPrevented`. Neither is this module's own submission,
  // so neither consumes `pendingSubmit` here -- the real submission, if it
  // still comes, gets it.
  if (pending.eventPhase !== Event.NONE || pending.defaultPrevented) return;

  pendingSubmit = null;

  const origin = storeOrigin();
  if (origin === null) return;

  const sessionId = getSession(origin);
  const { formData } = event as FormDataEvent;

  if (!sessionId || formData.has(SESSION_PARAM)) return;

  // A later listener (bubble phase, e.g. one on `window`) may have changed
  // `form.action` or the submitter's `formaction` after this module decided
  // to let the submission through. Re-check it still points at this store's
  // cart before handing over the id, so it cannot end up at another origin.
  if (!toCartUrl(actionOf(form, pending.submitter), origin)) return;

  formData.append(SESSION_PARAM, sessionId);
  // Only a reset form gets here with `empty=reset`: the reset path got this
  // session first, so the server must not reset again.
  if (formData.get("empty") === "reset") formData.delete("empty");
}

// Bubble phase for click and submit: they run after the merchant's own
// handlers, so `defaultPrevented` means another script already took over.
// Capture for formdata: it works whether or not the event bubbles.
document.addEventListener("click", onClick);
document.addEventListener("auxclick", onClick);
document.addEventListener("submit", onSubmit);
document.addEventListener("formdata", onFormData, true);

/** Removes the listeners. Tests need it; a merchant page never does. */
export function uninstallAddToCart(): void {
  document.removeEventListener("click", onClick);
  document.removeEventListener("auxclick", onClick);
  document.removeEventListener("submit", onSubmit);
  document.removeEventListener("formdata", onFormData, true);
}
