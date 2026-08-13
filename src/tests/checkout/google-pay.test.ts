/**
 * @vitest-environment jsdom
 */

import type { GooglePaymentsClient } from "../../checkout/types";

const GOOGLE_PAY_JS_API_URL = "https://pay.google.com/gp/p/js/pay.js";

type PaymentsClientConstructor = new (
  config: Record<string, unknown>,
) => GooglePaymentsClient;

type GooglePayWindow = Window & {
  google?: { payments?: { api?: { PaymentsClient?: PaymentsClientConstructor } } };
};

function getScripts(): HTMLScriptElement[] {
  return [
    ...document.querySelectorAll<HTMLScriptElement>(
      `script[src="${GOOGLE_PAY_JS_API_URL}"]`,
    ),
  ];
}

function getScript(): HTMLScriptElement {
  const [script] = getScripts();

  if (!script) {
    throw new Error("Expected a Google Pay script to be present.");
  }

  return script;
}

function flushTasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
}

/** Lets any already-queued macrotask run, so "never settles" is observable. */
function flushMacrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function track<T>(promise: Promise<T>): { settled: () => boolean } {
  let settled = false;
  const mark = (): void => {
    settled = true;
  };

  promise.then(mark, mark);

  return { settled: () => settled };
}

/**
 * Puts a loaded Google Pay namespace on window and returns the constructor spy
 * plus the client it hands out.
 */
function setLoadedGooglePay(
  client: GooglePaymentsClient = {
    createButton: vi.fn(),
    isReadyToPay: vi.fn(async () => ({ result: true })),
    loadPaymentData: vi.fn(),
  },
) {
  // Must be constructible: googlePay.ts calls `new PaymentsClient(...)`.
  const PaymentsClient = vi.fn(function PaymentsClientMock() {
    return client;
  });

  (window as GooglePayWindow).google = {
    payments: { api: { PaymentsClient: PaymentsClient as unknown as PaymentsClientConstructor } },
  };

  return { PaymentsClient, client };
}

function importGooglePay() {
  return import("../../checkout/utils/googlePay");
}

describe("Google Pay SDK loading", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(window as GooglePayWindow, "google");
    document.querySelectorAll("script").forEach((script) => script.remove());
  });

  it("resolves without appending a script when the namespace is already present", async () => {
    setLoadedGooglePay();

    const { loadGooglePaySdk } = await importGooglePay();

    await expect(loadGooglePaySdk()).resolves.toBeUndefined();
    expect(getScripts()).toHaveLength(0);
  });

  // Deliberately different from square.ts, which throws "Square SDK can only be
  // loaded in a browser environment." Google Pay loading is a no-op off-browser,
  // and the failure only surfaces when a client is actually requested.
  it("is a no-op outside a browser and only fails when a client is requested", async () => {
    vi.stubGlobal("window", undefined);

    const { canMakeGooglePayPayments, createGooglePaymentsClient, loadGooglePaySdk } =
      await importGooglePay();

    await expect(loadGooglePaySdk()).resolves.toBeUndefined();
    await expect(createGooglePaymentsClient()).rejects.toThrow(
      "Google Pay SDK is not available.",
    );
    await expect(canMakeGooglePayPayments({ type: "CARD" })).resolves.toBe(false);
    expect(getScripts()).toHaveLength(0);
  });

  it("appends an async script and resolves when it loads", async () => {
    const { loadGooglePaySdk } = await importGooglePay();

    const pending = loadGooglePaySdk();
    await flushTasks();

    const script = getScript();

    expect(script.src).toBe(GOOGLE_PAY_JS_API_URL);
    expect(script.async).toBe(true);
    expect(script.parentElement).toBe(document.head);
    expect(script.dataset.googlePaySdkState).toBe("loading");

    script.dispatchEvent(new Event("load"));

    await expect(pending).resolves.toBeUndefined();
  });

  it("rejects when the script it appended fails to load", async () => {
    const { loadGooglePaySdk } = await importGooglePay();

    const pending = loadGooglePaySdk();
    await flushTasks();

    getScript().dispatchEvent(new Event("error"));

    await expect(pending).rejects.toThrow("Failed to load Google Pay JS API.");
  });

  it("shares a single script between concurrent callers", async () => {
    const { loadGooglePaySdk } = await importGooglePay();

    const first = loadGooglePaySdk();
    const second = loadGooglePaySdk();
    await flushTasks();

    expect(getScripts()).toHaveLength(1);

    getScript().dispatchEvent(new Event("load"));

    await expect(first).resolves.toBeUndefined();
    await expect(second).resolves.toBeUndefined();
  });

  it("resolves against a pre-existing script already marked loaded, without waiting for an event", async () => {
    // No namespace on window, so only the marker can settle this: a bare
    // adoption path would attach listeners and hang.
    const existing = document.createElement("script");
    existing.src = GOOGLE_PAY_JS_API_URL;
    existing.dataset.googlePaySdkState = "loaded";
    document.head.appendChild(existing);

    const { loadGooglePaySdk } = await importGooglePay();

    await expect(loadGooglePaySdk()).resolves.toBeUndefined();
    expect(getScripts()).toEqual([existing]);
  });

  it("rejects immediately against a pre-existing script already marked failed", async () => {
    const existing = document.createElement("script");
    existing.src = GOOGLE_PAY_JS_API_URL;
    existing.dataset.googlePaySdkState = "error";
    document.head.appendChild(existing);

    const { loadGooglePaySdk } = await importGooglePay();
    const pending = loadGooglePaySdk();
    const tracker = track(pending);

    await flushMacrotasks();

    expect(tracker.settled()).toBe(true);
    await expect(pending).rejects.toThrow("Failed to load Google Pay JS API.");
  });

  it("marks the script it adopted as loaded once the namespace appears", async () => {
    const existing = document.createElement("script");
    existing.src = GOOGLE_PAY_JS_API_URL;
    document.head.appendChild(existing);

    const { loadGooglePaySdk } = await importGooglePay();

    const pending = loadGooglePaySdk();
    await flushTasks();

    setLoadedGooglePay();
    existing.dispatchEvent(new Event("load"));

    await expect(pending).resolves.toBeUndefined();
    expect(existing.dataset.googlePaySdkState).toBe("loaded");
  });

  // A script that carries no state marker and has not exposed the namespace is
  // indistinguishable from one that is still downloading — no DOM API reports a
  // load event that already fired. It is therefore treated as in flight.
  // applePay.ts has the same limitation. A pre-existing script that genuinely
  // finished is caught earlier, by the namespace check.
  it("waits for an event on an unmarked pre-existing script", async () => {
    const existing = document.createElement("script");
    existing.src = GOOGLE_PAY_JS_API_URL;
    document.head.appendChild(existing);

    const { loadGooglePaySdk } = await importGooglePay();

    const pending = loadGooglePaySdk();
    const tracker = track(pending);

    await flushMacrotasks();

    expect(tracker.settled()).toBe(false);

    existing.dispatchEvent(new Event("load"));
    await expect(pending).resolves.toBeUndefined();
  });

  it("retries with a fresh script after an adopted script fails", async () => {
    const existing = document.createElement("script");
    existing.src = GOOGLE_PAY_JS_API_URL;
    document.head.appendChild(existing);

    const { loadGooglePaySdk } = await importGooglePay();

    const first = loadGooglePaySdk();
    await flushTasks();

    existing.dispatchEvent(new Event("error"));

    await expect(first).rejects.toThrow("Failed to load Google Pay JS API.");
    // The failed script is gone, so nothing is left for the next call to adopt.
    expect(getScripts()).toHaveLength(0);

    const second = loadGooglePaySdk();
    const tracker = track(second);

    await flushMacrotasks();

    const retryScript = getScript();

    expect(retryScript).not.toBe(existing);
    expect(tracker.settled()).toBe(false);

    retryScript.dispatchEvent(new Event("load"));
    await expect(second).resolves.toBeUndefined();
  });

  it("retries with a fresh script after the script it appended fails", async () => {
    const { loadGooglePaySdk } = await importGooglePay();

    const first = loadGooglePaySdk();
    await flushTasks();

    const script = getScript();
    script.dispatchEvent(new Event("error"));

    await expect(first).rejects.toThrow("Failed to load Google Pay JS API.");

    const second = loadGooglePaySdk();
    const tracker = track(second);

    await flushMacrotasks();

    const retryScript = getScript();

    expect(getScripts()).toHaveLength(1);
    expect(retryScript).not.toBe(script);
    expect(tracker.settled()).toBe(false);

    retryScript.dispatchEvent(new Event("load"));
    await expect(second).resolves.toBeUndefined();
  });

  it("stops listening to a script once it has settled", async () => {
    const { loadGooglePaySdk } = await importGooglePay();

    const pending = loadGooglePaySdk();
    await flushTasks();

    const script = getScript();
    script.dispatchEvent(new Event("load"));

    await expect(pending).resolves.toBeUndefined();
    expect(script.dataset.googlePaySdkState).toBe("loaded");

    // A late error event on the settled script must not mark it failed, which
    // would make the next call reject against a script that loaded fine.
    script.dispatchEvent(new Event("error"));

    expect(script.dataset.googlePaySdkState).toBe("loaded");
    expect(getScripts()).toEqual([script]);
  });
});

describe("Google Pay payments client", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window as GooglePayWindow, "google");
    document.querySelectorAll("script").forEach((script) => script.remove());
  });

  it("constructs a client for the requested environment", async () => {
    const { PaymentsClient, client } = setLoadedGooglePay();
    const { createGooglePaymentsClient } = await importGooglePay();

    await expect(createGooglePaymentsClient("PRODUCTION")).resolves.toBe(client);
    expect(PaymentsClient).toHaveBeenCalledWith({ environment: "PRODUCTION" });
  });

  it("defaults to the TEST environment", async () => {
    const { PaymentsClient } = setLoadedGooglePay();
    const { createGooglePaymentsClient } = await importGooglePay();

    await createGooglePaymentsClient();

    expect(PaymentsClient).toHaveBeenCalledWith({ environment: "TEST" });
  });

  it("throws when the script loads without exposing PaymentsClient", async () => {
    const { createGooglePaymentsClient } = await importGooglePay();

    const pending = createGooglePaymentsClient();
    await flushTasks();

    getScript().dispatchEvent(new Event("load"));

    await expect(pending).rejects.toThrow("Google Pay SDK is not available.");
  });
});

describe("Google Pay availability", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window as GooglePayWindow, "google");
    document.querySelectorAll("script").forEach((script) => script.remove());
  });

  it("asks isReadyToPay with an apiVersion 2 request for the given method", async () => {
    const isReadyToPay = vi.fn(async () => ({ result: true }));
    const { PaymentsClient } = setLoadedGooglePay({
      createButton: vi.fn(),
      isReadyToPay,
      loadPaymentData: vi.fn(),
    });

    const { canMakeGooglePayPayments } = await importGooglePay();
    const allowedPaymentMethod = { type: "CARD" };

    await expect(canMakeGooglePayPayments(allowedPaymentMethod)).resolves.toBe(
      true,
    );

    expect(isReadyToPay).toHaveBeenCalledWith({
      allowedPaymentMethods: [allowedPaymentMethod],
      apiVersion: 2,
      apiVersionMinor: 0,
    });

    // The availability probe always builds a TEST client, even when the
    // checkout is otherwise configured for production.
    expect(PaymentsClient).toHaveBeenCalledWith({ environment: "TEST" });
  });

  it("reports unavailable when isReadyToPay says no", async () => {
    setLoadedGooglePay({
      createButton: vi.fn(),
      isReadyToPay: vi.fn(async () => ({ result: false })),
      loadPaymentData: vi.fn(),
    });

    const { canMakeGooglePayPayments } = await importGooglePay();

    await expect(canMakeGooglePayPayments({ type: "CARD" })).resolves.toBe(
      false,
    );
  });

  it("swallows errors from isReadyToPay and reports unavailable", async () => {
    setLoadedGooglePay({
      createButton: vi.fn(),
      isReadyToPay: vi.fn(async () => {
        throw new Error("network down");
      }),
      loadPaymentData: vi.fn(),
    });

    const { canMakeGooglePayPayments } = await importGooglePay();

    await expect(canMakeGooglePayPayments({ type: "CARD" })).resolves.toBe(
      false,
    );
  });
});
