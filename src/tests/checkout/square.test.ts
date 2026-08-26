/**
 * @vitest-environment jsdom
 */

import type {
  SquareSdkInstance,
  SquareSdkNamespace,
} from "../../checkout/types/SquareSdkInstance";
import type { APIJson } from "../../checkout/types";
import type { PaymentGatewayConfig } from "../../checkout/types/PaymentGatewayConfig";

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

  // A window.Square that is present but has no callable payments() is what a
  // half-initialized or partially failed script leaves behind. The fast path
  // used to hand it straight back, so the failure surfaced one layer later as
  // a bare TypeError from initializeSquareSdk, pointing at the wrong place
  // (FX-225). Both entry points must report the load failure instead.
  it("rejects a window.Square without payments() rather than returning it", async () => {
    const incomplete = {} as SquareSdkNamespace;
    (window as SquareWindow).Square = incomplete;

    const { initializeSquareSdk, loadSquareSdk } = await importSquare();

    await expect(loadSquareSdk("sandbox")).rejects.toThrow(
      "Square SDK is not available.",
    );
    expect(getScripts("sandbox")).toHaveLength(0);

    await expect(
      initializeSquareSdk({
        applicationId: "app-id",
        environment: "sandbox",
        locationId: "location-id",
      }),
    ).rejects.toThrow("Square SDK is not available.");
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

// Typed rather than bare `as const`: the union member requires apple_pay and
// google_pay, and a stub without them does not satisfy PaymentGatewayConfig.
const authorizeGatewayConfig: PaymentGatewayConfig = {
  type: "authorize",
  apple_pay: null,
  google_pay: null,
};
const squareGatewayConfig: PaymentGatewayConfig = {
  type: "square_up",
  application_id: "sandbox-sq0idb-application-id",
  location_id: "square-location-id",
  environment: "sandbox",
};

// Mirrors the fixture in adyen-embedded-payment-options.test.ts and
// klarna-payment-options.test.ts. Duplicated rather than shared because that is
// how those two do it; worth extracting if a fourth gateway needs one.
function createApiJson(
  payment_gateways: APIJson["payment_gateways"] = null,
): APIJson {
  return {
    template_set: { code: "default", id: 1 },
    session: { id: "session-id" },
    transaction: null,
    saved_payment_methods: null,
    next_action: null,
    debug: false,
    customer: {
      first_name: null,
      last_name: null,
      email: null,
      type: null,
      id: null,
      token: null,
    },
    shipments: [],
    items: [],
    totals: [
      {
        date: null,
        taxes: [],
        coupons: [],
        gift_cards: [],
        total_line_item_discount: 0,
        total_shipping: 0,
        total_shipping_with_tax: 0,
        total_shipping_value: 0,
        total_tax: 0,
        total_item_price: 0,
        total_item_price_with_tax: 0,
        total_weight: 0,
        total_weight_shippable: 0,
        total_order: 12.34,
      },
    ],
    use_separate_billing_address: true,
    billing_address: {
      address_id: null,
      address_name: "",
      first_name: "",
      last_name: "",
      company: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      region: "",
      postal_code: "",
      country: "US",
    },
    store: {
      id: 1,
      name: "Test Store",
      domain: "example.com",
      logo_url: "",
      website_url: "https://example.com",
      checkout_url: "https://example.com/checkout",
      cancel_and_continue_url: "https://example.com",
      has_location_dependent_taxes: false,
      has_eligible_gift_cards: false,
      has_eligible_coupons: false,
      supported_payment_cards: [],
    },
    messages: [],
    custom_fields: {},
    format: {
      weight_unit: "pound",
      locale_code: "en-US",
      currency_code: "USD",
      currency_display: "symbol",
      maximum_fraction_digits: 2,
    },
    display: {
      hidden_product_options: [],
      required_form_fields: [],
      hidden_form_fields: [],
      use_readonly_cart_on_checkout: false,
      use_tax_inclusive_pricing: false,
      secure_data_transfer_consent: "disabled",
      checkout_flow: "default",
      registration: "optional",
    },
    custom_config: {},
    payment_gateways,
    language_strings: {},
  };
}

async function createTestApi(json: APIJson) {
  const { API } = await import("../../checkout/API");

  return new API({ initialJson: json, storeDomain: "store.test" });
}

describe("hydrateJson with a Square gateway", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(window as SquareWindow, "Square");
    document.querySelectorAll("script").forEach((script) => script.remove());
  });

  /** Hydrates a Square gateway in and settles the SDK script. */
  async function createHydratedApi() {
    const instance = createInstance();
    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const hydratePromise = api.hydrateJson(
      createApiJson([squareGatewayConfig, authorizeGatewayConfig]),
    );

    await flushTasks();
    setLoadedSquare(vi.fn(async () => instance));
    getScript("sandbox").dispatchEvent(new Event("load"));
    await hydratePromise;

    return { api, instance };
  }

  // The basic case this file has never covered: square_up appears nowhere else
  // in src/tests, so nothing exercised the path from gateway config to
  // client.square.
  it("exposes the SDK instance once the Square script resolves", async () => {
    const { api, instance } = await createHydratedApi();

    expect(api.square).toBe(instance);
  });

  // Consumers re-hydrate from their own render, so an update event feeds back
  // into the render that triggered it. A hydrate that changes nothing has to
  // stay silent or the two sides drive each other in a loop (FX-179).
  it("does not emit an update when re-hydrating identical JSON", async () => {
    const { api } = await createHydratedApi();
    expect(api.square).not.toBeNull();

    let updates = 0;
    api.addEventListener("update", () => {
      updates++;
    });

    await api.hydrateJson(
      createApiJson([squareGatewayConfig, authorizeGatewayConfig]),
    );

    expect(updates).toBe(0);
  });

  // initializeSquareSdk caches per applicationId:locationId:environment, so a
  // re-hydrate resolves the very same instance. Anything reading `square`
  // mid-hydrate must never observe a null gap.
  it("keeps the Square SDK instance exposed throughout a re-hydrate", async () => {
    const { api, instance } = await createHydratedApi();

    const observed: (SquareSdkInstance | null)[] = [];
    api.addEventListener("update", () => {
      observed.push(api.square);
    });

    await api.hydrateJson(
      createApiJson([squareGatewayConfig, authorizeGatewayConfig]),
    );

    expect(observed).not.toContain(null);
    expect(api.square).toBe(instance);
  });
});
