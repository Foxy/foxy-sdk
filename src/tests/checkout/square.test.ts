/**
 * @vitest-environment jsdom
 */

import type {
  SquareSdkInstance,
  SquareSdkNamespace,
} from "../../checkout/types/SquareSdkInstance";

const SQUARE_JS_API_URL = {
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
  production: "https://web.squarecdn.com/v1/square.js",
} as const;

type SquareEnvironment = keyof typeof SQUARE_JS_API_URL;

type SquareWindow = Window & { Square?: SquareSdkNamespace };

function getScripts(environment: SquareEnvironment): HTMLScriptElement[] {
  return [
    ...document.querySelectorAll<HTMLScriptElement>(
      `script[src="${SQUARE_JS_API_URL[environment]}"]`,
    ),
  ];
}

function getScript(environment: SquareEnvironment): HTMLScriptElement {
  const [script] = getScripts(environment);

  if (!script) {
    throw new Error(`Expected a Square ${environment} script to be present.`);
  }

  return script;
}

function flushTasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
}

function createInstance(): SquareSdkInstance {
  return {
    ach: vi.fn(),
    applePay: vi.fn(),
    card: vi.fn(),
    googlePay: vi.fn(),
    paymentRequest: vi.fn(),
    verifyBuyer: vi.fn(),
  } as unknown as SquareSdkInstance;
}

/** Puts a loaded Square namespace on window and returns its payments() mock. */
function setLoadedSquare(
  payments: SquareSdkNamespace["payments"] = vi.fn(async () =>
    createInstance(),
  ),
): SquareSdkNamespace {
  const namespace = { payments } satisfies SquareSdkNamespace;
  (window as SquareWindow).Square = namespace;

  return namespace;
}

function importSquare() {
  return import("../../checkout/utils/square");
}

describe("Square SDK loading", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(window as SquareWindow, "Square");
    document
      .querySelectorAll("script")
      .forEach((script) => script.remove());
  });

  it("returns the namespace already on window without appending a script", async () => {
    const namespace = setLoadedSquare();
    const { loadSquareSdk } = await importSquare();

    await expect(loadSquareSdk("sandbox")).resolves.toBe(namespace);
    expect(getScripts("sandbox")).toHaveLength(0);
  });

  it("appends an async script for the requested environment", async () => {
    const { loadSquareSdk } = await importSquare();

    const pending = loadSquareSdk("production");
    await flushTasks();

    const script = getScript("production");

    expect(script.src).toBe(SQUARE_JS_API_URL.production);
    expect(script.async).toBe(true);
    expect(script.dataset.squareSdkState).toBe("loading");
    expect(script.parentElement).toBe(document.head);
    expect(getScripts("sandbox")).toHaveLength(0);

    // Settle the pending load so the rejection is never left floating.
    script.dispatchEvent(new Event("error"));
    await expect(pending).rejects.toThrow("Failed to load Square SDK.");
  });

  it("resolves with the namespace and marks the script loaded on load", async () => {
    const { loadSquareSdk } = await importSquare();

    const pending = loadSquareSdk("sandbox");
    await flushTasks();

    const namespace = setLoadedSquare();
    const script = getScript("sandbox");
    script.dispatchEvent(new Event("load"));

    await expect(pending).resolves.toBe(namespace);
    expect(script.dataset.squareSdkState).toBe("loaded");
  });

  it("rejects when the script loads but never exposes a namespace", async () => {
    const { loadSquareSdk } = await importSquare();

    const pending = loadSquareSdk("sandbox");
    await flushTasks();

    const script = getScript("sandbox");
    script.dispatchEvent(new Event("load"));

    await expect(pending).rejects.toThrow("Square SDK is not available.");
    expect(script.dataset.squareSdkState).toBe("error");
  });

  // Documents current behaviour, not desired behaviour: loadSquareSdk hands
  // back any truthy window.Square without checking that payments() exists,
  // even though the load-event path does check. A half-initialized namespace
  // therefore fails later, inside initializeSquareSdk, as a bare TypeError
  // rather than as the "Square SDK is not available." error.
  it("returns a window.Square without payments() instead of rejecting", async () => {
    const incomplete = {} as SquareSdkNamespace;
    (window as SquareWindow).Square = incomplete;

    const { initializeSquareSdk, loadSquareSdk } = await importSquare();

    await expect(loadSquareSdk("sandbox")).resolves.toBe(incomplete);
    expect(getScripts("sandbox")).toHaveLength(0);

    await expect(
      initializeSquareSdk({
        applicationId: "app-id",
        environment: "sandbox",
        locationId: "location-id",
      }),
    ).rejects.toThrow(TypeError);
  });

  it("rejects and marks the script errored when the script fails", async () => {
    const { loadSquareSdk } = await importSquare();

    const pending = loadSquareSdk("sandbox");
    await flushTasks();

    const script = getScript("sandbox");
    script.dispatchEvent(new Event("error"));

    await expect(pending).rejects.toThrow("Failed to load Square SDK.");
    expect(script.dataset.squareSdkState).toBe("error");
  });

  it("shares a single script and load promise between concurrent callers", async () => {
    const { loadSquareSdk } = await importSquare();

    const first = loadSquareSdk("sandbox");
    const second = loadSquareSdk("sandbox");
    await flushTasks();

    expect(getScripts("sandbox")).toHaveLength(1);

    const namespace = setLoadedSquare();
    getScript("sandbox").dispatchEvent(new Event("load"));

    await expect(first).resolves.toBe(namespace);
    await expect(second).resolves.toBe(namespace);
  });

  it("rejects immediately when a previously failed script is still in the document", async () => {
    const stale = document.createElement("script");
    stale.src = SQUARE_JS_API_URL.sandbox;
    stale.dataset.squareSdkState = "error";
    document.head.appendChild(stale);

    const { loadSquareSdk } = await importSquare();

    await expect(loadSquareSdk("sandbox")).rejects.toThrow(
      "Failed to load Square SDK.",
    );
    expect(getScripts("sandbox")).toHaveLength(1);
  });

  it("refuses to load outside a browser environment", async () => {
    vi.stubGlobal("window", undefined);

    const { loadSquareSdk } = await importSquare();

    await expect(loadSquareSdk("sandbox")).rejects.toThrow(
      "Square SDK can only be loaded in a browser environment.",
    );
  });
});

describe("Square SDK initialization", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window as SquareWindow, "Square");
    document
      .querySelectorAll("script")
      .forEach((script) => script.remove());
  });

  it("initializes payments with the application and location ids", async () => {
    const instance = createInstance();
    const payments = vi.fn(async () => instance);
    setLoadedSquare(payments);

    const { initializeSquareSdk } = await importSquare();

    await expect(
      initializeSquareSdk({
        applicationId: "app-id",
        environment: "sandbox",
        locationId: "location-id",
      }),
    ).resolves.toBe(instance);

    expect(payments).toHaveBeenCalledTimes(1);
    expect(payments).toHaveBeenCalledWith("app-id", "location-id");
  });

  it("caches the instance per application, location and environment", async () => {
    const payments = vi.fn(async () => createInstance());
    setLoadedSquare(payments);

    const { initializeSquareSdk } = await importSquare();
    const params = {
      applicationId: "app-id",
      environment: "sandbox",
      locationId: "location-id",
    } as const;

    const first = await initializeSquareSdk(params);
    const second = await initializeSquareSdk(params);

    expect(second).toBe(first);
    expect(payments).toHaveBeenCalledTimes(1);

    const other = await initializeSquareSdk({
      ...params,
      locationId: "other-location-id",
    });

    expect(other).not.toBe(first);
    expect(payments).toHaveBeenCalledTimes(2);
  });

  it("evicts the cached instance on failure so the next call retries", async () => {
    const instance = createInstance();
    const payments = vi
      .fn<SquareSdkNamespace["payments"]>()
      .mockRejectedValueOnce(new Error("payments failed"))
      .mockResolvedValueOnce(instance);

    setLoadedSquare(payments);

    const { initializeSquareSdk } = await importSquare();
    const params = {
      applicationId: "app-id",
      environment: "sandbox",
      locationId: "location-id",
    } as const;

    await expect(initializeSquareSdk(params)).rejects.toThrow(
      "payments failed",
    );
    await expect(initializeSquareSdk(params)).resolves.toBe(instance);
    expect(payments).toHaveBeenCalledTimes(2);
  });
});
