/**
 * @vitest-environment jsdom
 */

import type { KlarnaSdkInstance } from "../../checkout/types";
import type { SquareSdkNamespace } from "../../checkout/types/SquareSdkInstance";
import { isSettledForeignScript } from "../../checkout/utils/adoptedScript";

const SQUARE_SANDBOX_URL = "https://sandbox.web.squarecdn.com/v1/square.js";
const KLARNA_URL = "https://x.klarnacdn.net/kp/lib/v1/api.js";

type SquareWindow = Window & { Square?: SquareSdkNamespace };
type KlarnaWindow = Window & {
  Klarna?: KlarnaSdkInstance;
  klarnaAsyncCallback?: () => void;
};

/** Appends a script tag, optionally marked as one this SDK created. */
function appendScript(
  url = SQUARE_SANDBOX_URL,
  ownState?: string,
): HTMLScriptElement {
  const script = document.createElement("script");
  script.src = url;

  if (ownState !== undefined) {
    script.dataset.squareSdkState = ownState;
  }

  document.head.appendChild(script);

  return script;
}

/** Reports a completed fetch for each given URL, as Resource Timing would. */
function stubResourceTimings(...urls: string[]): void {
  vi.spyOn(performance, "getEntriesByType").mockImplementation((type) =>
    type === "resource"
      ? (urls.map((name) => ({ name })) as unknown as PerformanceEntryList)
      : [],
  );
}

function flushTasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
}

describe("isSettledForeignScript", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.querySelectorAll("script").forEach((script) => script.remove());
  });

  // The marker is what distinguishes our own tag from anyone else's. Our own
  // tags always have live listeners attached, so a timing entry on one says
  // nothing interesting — the load event is still coming or has been handled.
  it("is false for a script this SDK created, entry or not", () => {
    const script = appendScript(SQUARE_SANDBOX_URL, "loading");
    stubResourceTimings(SQUARE_SANDBOX_URL);

    expect(isSettledForeignScript(script, "squareSdkState")).toBe(false);
  });

  // No entry means the fetch has not finished, so the load and error events are
  // still to come and waiting on them is correct.
  it("is false for a foreign script with no timing entry", () => {
    const script = appendScript();
    stubResourceTimings();

    expect(isSettledForeignScript(script, "squareSdkState")).toBe(false);
  });

  it("is true for a foreign script whose fetch has completed", () => {
    const script = appendScript();
    stubResourceTimings(SQUARE_SANDBOX_URL);

    expect(isSettledForeignScript(script, "squareSdkState")).toBe(true);
  });

  it("ignores timing entries for other URLs", () => {
    const script = appendScript();
    stubResourceTimings("https://example.com/other.js");

    expect(isSettledForeignScript(script, "squareSdkState")).toBe(false);
  });

  // Without the API there is no signal, so the loaders must keep their previous
  // behaviour rather than reject a script that may well be fine.
  it("is false when the Resource Timing API is unavailable", () => {
    const script = appendScript();
    vi.stubGlobal("performance", {});

    expect(isSettledForeignScript(script, "squareSdkState")).toBe(false);
  });
});

describe("loadSquareSdk with a script it did not create", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window as SquareWindow, "Square");
    document.querySelectorAll("script").forEach((script) => script.remove());
  });

  // Before this guard the loader attached listeners to an already-settled tag,
  // so neither event could fire again and the cached promise stayed pending
  // forever — no rejection, nothing logged, the gateway simply never appeared.
  it("rejects instead of waiting forever on an already-settled foreign script", async () => {
    appendScript();
    stubResourceTimings(SQUARE_SANDBOX_URL);

    const { loadSquareSdk } = await import("../../checkout/utils/square");

    await expect(loadSquareSdk("sandbox")).rejects.toThrow(
      "A Square SDK script added outside the Foxy SDK has already failed to load.",
    );
  });

  it("keeps waiting on a foreign script that is still in flight", async () => {
    const script = appendScript();
    stubResourceTimings();

    const { loadSquareSdk } = await import("../../checkout/utils/square");
    const pending = loadSquareSdk("sandbox");
    let didSettle = false;

    void pending.then(
      () => (didSettle = true),
      () => (didSettle = true),
    );

    await flushTasks();
    expect(didSettle).toBe(false);

    const namespace = { payments: vi.fn() } as unknown as SquareSdkNamespace;
    (window as SquareWindow).Square = namespace;
    script.dispatchEvent(new Event("load"));

    await expect(pending).resolves.toBe(namespace);
  });
});

describe("loadKlarnaSdk with a script it did not create", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window as KlarnaWindow, "Klarna");
    Reflect.deleteProperty(window as KlarnaWindow, "klarnaAsyncCallback");
    document.querySelectorAll("script").forEach((script) => script.remove());
  });

  it("rejects an already-settled foreign script when no namespace exists", async () => {
    appendScript(KLARNA_URL);
    stubResourceTimings(KLARNA_URL);

    const { loadKlarnaSdk } = await import("../../checkout/utils/klarna");

    await expect(loadKlarnaSdk()).rejects.toThrow(
      "A Klarna SDK script added outside the Foxy SDK has already failed to load.",
    );
  });

  // Klarna signals readiness through klarnaAsyncCallback, not through the
  // script's load event, so once a namespace is present a finished fetch says
  // nothing about whether the callback is still to come. This must hold both
  // before and after FX-304 tightens the fast path above the guard: an
  // incomplete namespace may start waiting, but must never be rejected as a
  // duplicate tag.
  it("never reports a duplicate tag once a namespace is present", async () => {
    appendScript(KLARNA_URL);
    stubResourceTimings(KLARNA_URL);
    (window as KlarnaWindow).Klarna = {} as KlarnaSdkInstance;

    const { loadKlarnaSdk } = await import("../../checkout/utils/klarna");

    let rejection: unknown = null;
    void loadKlarnaSdk().catch((error: unknown) => {
      rejection = error;
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(rejection).toBeNull();
  });
});
