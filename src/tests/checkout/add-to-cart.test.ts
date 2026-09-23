/** @vitest-environment jsdom */
// src/tests/checkout/add-to-cart.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readCachedState, writeCachedState } from "../../checkout/side-cart/session-cache";

const ORIGIN = "https://demo.foxycart.test";
const CART = `${ORIGIN}/cart?name=Shirt&price=10`;

let uninstall: (() => void) | null = null;

/**
 * A fresh module per test (its listeners go on the shared jsdom document, so
 * `afterEach` removes them). `sideCart: true` installs a fake transport the
 * way importing `checkout/side-cart` would.
 */
async function load(options: { sideCart?: boolean } = {}) {
  vi.resetModules();
  const { client } = await import("../../checkout/client");
  client.setStoreDomain("demo.foxycart.test");
  // setStoreDomain makes the client GET /cart itself (API.ts:599-606), and
  // that fetch runs synchronously. Forget it, so a test's fetch assertions
  // only see this module's requests.
  vi.mocked(fetch).mockClear();
  const transport = { invoke: vi.fn().mockResolvedValue(undefined), show: vi.fn() };
  if (options.sideCart) client.setSideCartTransport(transport);
  const addItem = vi.spyOn(client, "addItem");
  const module = await import("../../checkout/add-to-cart");
  uninstall = module.uninstallAddToCart;
  return { client, transport, addItem };
}

function link(href: string, attributes: Record<string, string> = {}): HTMLAnchorElement {
  const element = document.createElement("a");
  element.href = href;
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  element.textContent = "Add";
  document.body.append(element);
  return element;
}

function click(target: Element, init: MouseEventInit = {}, type = "click"): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, ...init });
  target.dispatchEvent(event);
  return event;
}

function form(action: string, fields: Record<string, string>, method = "post"): HTMLFormElement {
  const element = document.createElement("form");
  element.action = action;
  element.method = method;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.name = name;
    input.value = value;
    element.append(input);
  }
  document.body.append(element);
  return element;
}

function submit(target: HTMLFormElement, submitter: HTMLElement | null = null): SubmitEvent {
  const event = new SubmitEvent("submit", { bubbles: true, cancelable: true, submitter });
  target.dispatchEvent(event);
  return event;
}

/** What the browser would send for a form submission: fires `formdata`. */
function entries(target: HTMLFormElement): [string, string][] {
  const data = new FormData(target);
  const event = new Event("formdata", { bubbles: true });
  Object.defineProperty(event, "formData", { value: data });
  target.dispatchEvent(event);
  return [...data].map(([name, value]) => [name, String(value)]);
}

const WAS_DEFAULT_PREVENTED = Symbol("wasDefaultPrevented");

/**
 * What the module (and any earlier listener) decided, captured by
 * `suppressNavigation` before it force-cancels the event. Reading
 * `event.defaultPrevented` after dispatch would always answer `true`, since
 * `suppressNavigation` itself cancels every click -- see there.
 */
function wasDefaultPrevented(event: Event): boolean {
  return (event as unknown as Record<symbol, boolean>)[WAS_DEFAULT_PREVENTED] ?? event.defaultPrevented;
}

/**
 * jsdom does not implement following a link (`Not implemented: navigation to
 * another Document`), and logs that instead of silently no-op'ing whenever a
 * real `<a href>` click reaches its default action unprevented. Registered on
 * `window` -- the last stop in the bubble phase, after the module's own
 * `document` listener -- so it runs once the module has already decided
 * whether to cancel the click, records that decision, and then always cancels
 * the click itself so jsdom never attempts the navigation it can't perform.
 */
function suppressNavigation(event: Event): void {
  (event as unknown as Record<symbol, boolean>)[WAS_DEFAULT_PREVENTED] = event.defaultPrevented;
  event.preventDefault();
}

let assign: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  assign = vi.fn();
  vi.spyOn(window, "location", "get").mockReturnValue({
    ...window.location,
    href: window.location.href,
    origin: window.location.origin,
    assign,
  } as unknown as Location);
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("no CORS in tests"));
  window.addEventListener("click", suppressNavigation);
  window.addEventListener("auxclick", suppressNavigation);
});

afterEach(() => {
  uninstall?.();
  uninstall = null;
  window.removeEventListener("click", suppressNavigation);
  window.removeEventListener("auxclick", suppressNavigation);
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("checkout/add-to-cart: matching", () => {
  it("ignores other origins, lookalike hosts and other paths", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });

    for (const href of [
      "https://other.test/cart?name=Shirt",
      "https://demo.foxycart.test.evil.test/cart?name=Shirt",
      `${ORIGIN}/checkout`,
      `${ORIGIN}/cart/extra`,
    ]) {
      const event = click(link(href));
      expect(wasDefaultPrevented(event)).toBe(false);
    }
    expect(assign).not.toHaveBeenCalled();
  });

  it("ignores a click another script already handled", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = link(CART);
    element.addEventListener("click", (event) => event.preventDefault());

    click(element);

    expect(assign).not.toHaveBeenCalled();
  });

  it("matches a click on an element inside the link", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const inner = document.createElement("span");
    link(CART).append(inner);

    click(inner);

    expect(assign).toHaveBeenCalledWith(`${CART}&session_id=s-1`);
  });
});

describe("checkout/add-to-cart: full-page links", () => {
  it("navigates with the cached session and leaves the href alone", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = link(CART);

    const event = click(element);

    expect(wasDefaultPrevented(event)).toBe(true);
    expect(assign).toHaveBeenCalledWith(`${CART}&session_id=s-1`);
    expect(element.getAttribute("href")).toBe(CART);
  });

  it("sends the new session after it changed between two clicks", async () => {
    await load();
    const element = link(CART);

    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    click(element);
    writeCachedState(ORIGIN, { sessionId: "s-2", itemCount: 0 });
    click(element);

    expect(assign).toHaveBeenNthCalledWith(2, `${CART}&session_id=s-2`);
    expect(element.getAttribute("href")).toBe(CART);
  });

  it("keeps a session_id the merchant wrote", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });

    const event = click(link(`${CART}&session_id=merchant`));

    expect(wasDefaultPrevented(event)).toBe(false);
    expect(assign).not.toHaveBeenCalled();
  });

  it("gets a session first when none is cached", async () => {
    await load();
    // A fresh Response per call: a body can be read only once.
    vi.mocked(fetch).mockImplementation(async () =>
      new Response(JSON.stringify({ session: { id: "s-new" } }), { status: 200 }),
    );

    const event = click(link(CART));

    expect(wasDefaultPrevented(event)).toBe(true);
    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith(`${CART}&session_id=s-new`));
  });

  it("goes without a session when none can be had", async () => {
    await load();

    click(link(CART));

    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith(CART));
  });

  it("on empty=reset, gets a new session and sends it without empty", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-old", itemCount: 4 });
    vi.mocked(fetch).mockImplementation(async () =>
      new Response(JSON.stringify({ session: { id: "s-new" } }), { status: 200 }),
    );

    const event = click(link(`${CART}&empty=reset`));

    expect(wasDefaultPrevented(event)).toBe(true);
    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith(`${CART}&session_id=s-new`));
    expect(readCachedState(ORIGIN)).toEqual({ sessionId: "s-new", itemCount: 0 });
  });

  it("on empty=reset with no session to be had, sends the link as it is", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-old", itemCount: 4 });

    click(link(`${CART}&empty=reset`));

    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith(`${CART}&empty=reset`));
    expect(readCachedState(ORIGIN)).toEqual({ sessionId: null, itemCount: 0 });
  });

  it("keeps the session on empty=true", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });

    click(link(`${CART}&empty=true`));

    expect(assign).toHaveBeenCalledWith(`${CART}&empty=true&session_id=s-1`);
  });
});

describe("checkout/add-to-cart: new-tab links", () => {
  it.each([
    ["ctrl-click", "click", { ctrlKey: true }, {}],
    ["cmd-click", "click", { metaKey: true }, {}],
    ["shift-click", "click", { shiftKey: true }, {}],
    ["middle click", "auxclick", { button: 1 }, {}],
    ["target=_blank", "click", {}, { target: "_blank" }],
  ])("%s: swaps the href for one tick, never preventDefault", async (_name, type, init, attributes) => {
    vi.useFakeTimers();
    await load({ sideCart: true });
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = link(CART, attributes);
    let hrefDuringDefault: string | null = null;
    // A later listener sees what the browser's default action will read.
    document.addEventListener(type, () => (hrefDuringDefault = element.getAttribute("href")), { once: true });

    const event = click(element, init, type);

    expect(wasDefaultPrevented(event)).toBe(false);
    expect(hrefDuringDefault).toBe(`${CART}&session_id=s-1`);
    await vi.advanceTimersByTimeAsync(0);
    expect(element.getAttribute("href")).toBe(CART);
  });

  it("leaves a new-tab click alone when no session is cached", async () => {
    await load();
    const element = link(CART);

    const event = click(element, { ctrlKey: true });

    expect(wasDefaultPrevented(event)).toBe(false);
    expect(element.getAttribute("href")).toBe(CART);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("never swaps the href of a ping link (the browser would leak the session to the ping URL)", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = link(CART, { ping: "https://tracker.test/ping" });

    const event = click(element, { ctrlKey: true });

    expect(wasDefaultPrevented(event)).toBe(false);
    expect(element.getAttribute("href")).toBe(CART);
  });

  it.each([["right click", 2], ["back button", 3], ["forward button", 4]])(
    "ignores an auxclick that is not the middle button (%s)",
    async (_name, button) => {
      await load();
      writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
      const element = link(CART);
      let hrefDuringDefault: string | null = null;
      document.addEventListener("auxclick", () => (hrefDuringDefault = element.getAttribute("href")), {
        once: true,
      });

      const event = click(element, { button }, "auxclick");

      expect(wasDefaultPrevented(event)).toBe(false);
      expect(hrefDuringDefault).toBe(CART);
      expect(element.getAttribute("href")).toBe(CART);
    },
  );
});

describe("checkout/add-to-cart: sidecart mode", () => {
  it("adds through the sidecart and opens it", async () => {
    const { transport, addItem } = await load({ sideCart: true });

    const event = click(link(CART));

    expect(wasDefaultPrevented(event)).toBe(true);
    expect(addItem).toHaveBeenCalledWith([["name", "Shirt"], ["price", "10"]]);
    expect(transport.show).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("passes empty=reset through in the same addItem call", async () => {
    const { addItem } = await load({ sideCart: true });

    click(link(`${CART}&empty=reset`));

    expect(addItem).toHaveBeenCalledWith([["name", "Shirt"], ["price", "10"], ["empty", "reset"]]);
  });

  it("routes a sidecart error to reportSideCartError instead of letting it escape the click", async () => {
    const { client, transport, addItem } = await load({ sideCart: true });
    const reportSideCartError = vi.spyOn(client, "reportSideCartError");
    transport.show.mockImplementation(() => {
      throw new Error("boom");
    });

    const event = click(link(CART));

    expect(wasDefaultPrevented(event)).toBe(true);
    expect(addItem).toHaveBeenCalled();
    expect(reportSideCartError).toHaveBeenCalledWith(expect.any(Error));
  });

  it.each([`${CART}&cart=checkout`, `${CART}&redirect=https://shop.test/thanks`])(
    "goes full-page for %s",
    async (href) => {
      const { addItem } = await load({ sideCart: true });
      writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });

      click(link(href));

      // Built the same way the handler builds it: URLSearchParams encodes
      // the redirect URL's ":" and "/".
      const expected = new URL(href);
      expected.searchParams.set("session_id", "s-1");
      expect(addItem).not.toHaveBeenCalled();
      expect(assign).toHaveBeenCalledWith(expected.href);
    },
  );
});

describe("checkout/add-to-cart: custom mode", () => {
  it("stops everything when the merchant cancels foxy:add-to-cart", async () => {
    const { addItem } = await load({ sideCart: true });
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const listener = vi.fn((event: Event) => event.preventDefault());
    document.addEventListener("foxy:add-to-cart", listener);

    const event = click(link(CART));

    document.removeEventListener("foxy:add-to-cart", listener);
    expect(wasDefaultPrevented(event)).toBe(true);
    expect(addItem).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
    const detail = (listener.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.params).toEqual([["name", "Shirt"], ["price", "10"]]);
    expect(detail.sessionId).toBe("s-1");
    expect(detail.url.href).toBe(CART);
  });
});

describe("checkout/add-to-cart: forms", () => {
  it("adds session_id to the submission, not to the DOM", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = form(`${ORIGIN}/cart`, { name: "Shirt" });

    const event = submit(element);
    const sent = entries(element);

    expect(event.defaultPrevented).toBe(false);
    expect(sent).toEqual([["name", "Shirt"], ["session_id", "s-1"]]);
    expect(element.querySelector('[name="session_id"]')).toBeNull();
  });

  it("never touches the merchant's own new FormData(form)", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = form(`${ORIGIN}/cart`, { name: "Shirt" });

    expect(entries(element)).toEqual([["name", "Shirt"]]);
  });

  it("never adds session_id to a window listener's own FormData once it cancels the submit", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = form(`${ORIGIN}/cart`, { name: "Shirt" });
    let sent: [string, string][] | null = null;
    // Stands in for a merchant's own script -- jQuery's $(document).on(...),
    // or any submit listener added after this module loads. It runs after
    // ours (bubble phase, further from the target) and does exactly what a
    // common `fetch`-based add-to-cart pattern does: cancel the browser's
    // own submission and build its own FormData from the same form.
    const onWindowSubmit = (event: Event) => {
      event.preventDefault();
      sent = entries(element);
    };
    window.addEventListener("submit", onWindowSubmit);

    submit(element);

    window.removeEventListener("submit", onWindowSubmit);
    expect(sent).toEqual([["name", "Shirt"]]);
  });

  it("never adds session_id to a window listener's own FormData mid-dispatch, only once the submit has ended", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = form(`${ORIGIN}/cart`, { name: "Shirt" });
    let duringDispatch: [string, string][] | null = null;
    // Same shape as above, but this one never cancels: it still must not get
    // the id, because it runs *during* the submit dispatch, not after it --
    // `onFormData` cannot yet tell this from a browser's own eventual
    // `formdata` for the same submission.
    const onWindowSubmit = () => {
      duringDispatch = entries(element);
    };
    window.addEventListener("submit", onWindowSubmit);

    submit(element);

    window.removeEventListener("submit", onWindowSubmit);
    expect(duringDispatch).toEqual([["name", "Shirt"]]);
    // The dispatch has now ended and nothing cancelled it -- this is what the
    // browser's own `formdata`, fired after dispatch, would see.
    expect(entries(element)).toEqual([["name", "Shirt"], ["session_id", "s-1"]]);
  });

  it("treats a nested session_id input as already present", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = form(`${ORIGIN}/cart`, { name: "Shirt" });
    const fieldset = document.createElement("fieldset");
    const input = document.createElement("input");
    input.name = "session_id";
    input.value = "merchant";
    fieldset.append(input);
    element.append(fieldset);

    submit(element);

    expect(entries(element)).toEqual([["name", "Shirt"], ["session_id", "merchant"]]);
  });

  it("on empty=reset, gets a new session, then sends it without empty", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-old", itemCount: 1 });
    vi.mocked(fetch).mockImplementation(async () =>
      new Response(JSON.stringify({ session: { id: "s-new" } }), { status: 200 }),
    );
    const element = form(`${ORIGIN}/cart`, { empty: "reset", name: "Shirt" });
    let sent: [string, string][] = [];
    // Stands in for the browser: a re-submit fires submit, then formdata --
    // both synchronously, back to back, the way a real `requestSubmit()`
    // does. jsdom implements neither, hence the mock; capturing `sent` here
    // (rather than calling `entries()` again afterwards) avoids a race with
    // `onSubmit`'s own `pendingSubmit` cleanup, which real browser timing
    // never exposes: `formdata` always fires before that cleanup's timer.
    const requestSubmit = vi.spyOn(element, "requestSubmit").mockImplementation(() => {
      submit(element);
      sent = entries(element);
    });

    const event = submit(element);
    expect(event.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(requestSubmit).toHaveBeenCalled());

    expect(sent).toEqual([["name", "Shirt"], ["session_id", "s-new"]]);
  });

  it("gets a session first, then submits again with the same submitter", async () => {
    await load();
    vi.mocked(fetch).mockImplementation(async () =>
      new Response(JSON.stringify({ session: { id: "s-new" } }), { status: 200 }),
    );
    const element = form(`${ORIGIN}/cart`, { name: "Shirt" });
    const button = document.createElement("button");
    button.name = "quantity";
    button.value = "2";
    element.append(button);
    let sent: [string, string][] = [];
    // Same as the empty=reset case above: simulate submit-then-formdata
    // inline, with the same submitter the real resubmit passes through.
    const requestSubmit = vi
      .spyOn(element, "requestSubmit")
      .mockImplementation((submitter?: HTMLElement | null) => {
        submit(element, submitter ?? null);
        sent = entries(element);
      });

    const event = submit(element, button);

    expect(event.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(requestSubmit).toHaveBeenCalledWith(button));
    expect(getCached()).toBe("s-new");
    // `new FormData(form)` never includes a submit button's own value --
    // only `pairsOf` (what reaches `addItem`) adds it explicitly -- so the
    // resubmission's entries are the form's own fields plus the session id.
    expect(sent).toEqual([["name", "Shirt"], ["session_id", "s-new"]]);
  });

  it("adds through the sidecart with the submitter's value", async () => {
    const { addItem, transport } = await load({ sideCart: true });
    const element = form(`${ORIGIN}/cart`, { name: "Shirt" });
    const button = document.createElement("button");
    button.name = "quantity";
    button.value = "2";
    element.append(button);

    const event = submit(element, button);

    expect(event.defaultPrevented).toBe(true);
    expect(addItem).toHaveBeenCalledWith([["name", "Shirt"], ["quantity", "2"]]);
    expect(transport.show).toHaveBeenCalled();
  });

  it("never adds session_id once the submit dispatch has ended and the listener cancelled it", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = form(`${ORIGIN}/cart`, { name: "Shirt" });
    const onWindowSubmit = (event: Event) => event.preventDefault();
    window.addEventListener("submit", onWindowSubmit);

    submit(element);

    window.removeEventListener("submit", onWindowSubmit);
    expect(entries(element)).toEqual([["name", "Shirt"]]);
  });

  it("re-checks the action before appending session_id, in case a later listener redirected the form", async () => {
    await load();
    writeCachedState(ORIGIN, { sessionId: "s-1", itemCount: 0 });
    const element = form(`${ORIGIN}/cart`, { name: "Shirt" });
    const onWindowSubmit = () => {
      element.action = "https://other.test/collect";
    };
    window.addEventListener("submit", onWindowSubmit);

    submit(element);

    window.removeEventListener("submit", onWindowSubmit);
    expect(entries(element)).toEqual([["name", "Shirt"]]);
  });

  it("keeps the action's query for a POST form", async () => {
    const { addItem } = await load({ sideCart: true });

    submit(form(`${ORIGIN}/cart?cart=add`, { name: "Shirt" }));

    expect(addItem).toHaveBeenCalledWith([["cart", "add"], ["name", "Shirt"]]);
  });
});

function getCached(): string | null {
  return readCachedState(ORIGIN)?.sessionId ?? null;
}
