/**
 * @vitest-environment jsdom
 */

import type { APIJson } from "../../checkout/types";

import { API as HttpCheckoutAPI } from "../../checkout/API";

const APPLE_PAY_JS_API_URL =
  "https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js";

type RuntimeGlobals = typeof globalThis & {
  ApplePaySession?: { canMakePayments?: () => boolean };
};

type ApplePayWindow = Window & {
  ApplePaySession?: { canMakePayments?: () => boolean };
};

const runtime = globalThis as RuntimeGlobals;

const cardOption = { type: "new-card", gateway: "authorize" } as const;
const authorizeGatewayConfig = { type: "authorize" } as const;
const authorizeGatewayConfigWithApplePay = {
  type: "authorize",
  apple_pay: {
    merchant_id: "merchant.example",
  },
} as const;
const applePayOption = {
  type: "apple-pay",
  gateway: "authorize",
  merchant_id: "merchant.example",
} as const;

const hadWindow = "window" in globalThis;
const hadDocument = "document" in globalThis;
const hadApplePaySession = "ApplePaySession" in runtime;
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalApplePaySession = runtime.ApplePaySession;

function getApplePayScript(): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(`script[src="${APPLE_PAY_JS_API_URL}"]`);
}

function flushTasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
}

async function resolveApplePayScriptLoad(
  applePayAvailable?: boolean,
): Promise<void> {
  if (applePayAvailable !== undefined) {
    (window as ApplePayWindow).ApplePaySession = {
      canMakePayments: vi.fn(() => applePayAvailable),
    };
  }

  const script = getApplePayScript();

  if (!script) {
    throw new Error("Expected Apple Pay script to be present.");
  }

  script.dispatchEvent(new Event("load"));
  await flushTasks();
}

async function rejectApplePayScriptLoad(): Promise<void> {
  const script = getApplePayScript();

  if (!script) {
    throw new Error("Expected Apple Pay script to be present.");
  }

  script.dispatchEvent(new Event("error"));
  await flushTasks();
}

class TestHttpCheckoutAPI extends HttpCheckoutAPI {
  async replaceJsonForTesting(nextJson: APIJson): Promise<void> {
    await this.replaceJson(nextJson);
  }
}

function createTestApi(json: APIJson): TestHttpCheckoutAPI {
  return new TestHttpCheckoutAPI({
    initialJson: json,
    storeDomain: "store.test",
  });
}

function createApiJson(
  payment_gateways?: APIJson["payment_gateways"],
): APIJson {
  return {
    template_set: { code: "default", id: 1 },
    session: { name: "fcsid", id: "session-id" },
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
        total_order: 0,
      },
    ],
    billing_address: {
      use_customer_shipping_address: false,
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

function setBrowserRuntime(applePayAvailable?: boolean): void {
  Object.defineProperty(globalThis, "window", {
    value: originalWindow,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: originalDocument,
    configurable: true,
    writable: true,
  });

  if (applePayAvailable === undefined) {
    Reflect.deleteProperty(window as ApplePayWindow, "ApplePaySession");
    return;
  }

  (window as ApplePayWindow).ApplePaySession = {
    canMakePayments: vi.fn(() => applePayAvailable),
  };
}

function unsetBrowserRuntime(): void {
  Object.defineProperty(globalThis, "window", {
    value: undefined,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: undefined,
    configurable: true,
    writable: true,
  });
  Reflect.deleteProperty(runtime, "ApplePaySession");
}

function restoreRuntime(): void {
  if (hadWindow) {
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      configurable: true,
      writable: true,
    });
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }

  if (hadDocument) {
    Object.defineProperty(globalThis, "document", {
      value: originalDocument,
      configurable: true,
      writable: true,
    });
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }

  if (hadApplePaySession) {
    runtime.ApplePaySession = originalApplePaySession;
  } else {
    delete runtime.ApplePaySession;
  }
}

describe("Apple Pay payment option filtering", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    getApplePayScript()?.remove();
    restoreRuntime();
  });

  it.skip("loads the Apple Pay JS API script when Apple Pay appears in payment options", () => {
    setBrowserRuntime(false);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    createTestApi(createApiJson([authorizeGatewayConfigWithApplePay]));

    const script = getApplePayScript();

    expect(script).not.toBeNull();
    expect(script?.src).toBe(APPLE_PAY_JS_API_URL);
  });

  it("does not load the Apple Pay JS API script when Apple Pay is absent", () => {
    setBrowserRuntime(false);

    createTestApi(createApiJson([authorizeGatewayConfig]));

    expect(getApplePayScript()).toBeNull();
  });

  it("does not duplicate the Apple Pay JS API script when it is already present", () => {
    setBrowserRuntime(false);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const existingScript = document.createElement("script");
    existingScript.src = APPLE_PAY_JS_API_URL;
    document.head.appendChild(existingScript);

    createTestApi(createApiJson([authorizeGatewayConfigWithApplePay]));

    expect(
      document.querySelectorAll(`script[src="${APPLE_PAY_JS_API_URL}"]`),
    ).toHaveLength(1);
  });

  it.skip("keeps raw Apple Pay options and removes them from resolved payment options outside the browser", async () => {
    unsetBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = createTestApi(
      createApiJson([authorizeGatewayConfigWithApplePay]),
    );

    await flushTasks();

    expect(api.json!.payment_gateways).toEqual([
      authorizeGatewayConfigWithApplePay,
    ]);
    expect(api.paymentOptions).toEqual([cardOption]);
    expect(warnSpy).toHaveBeenCalledWith(
      "Apple Pay payment options were removed because checkout API JSON was processed outside a browser environment.",
    );
  });

  it.skip("waits for the first Apple Pay SDK load before removing unavailable Apple Pay options", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = createTestApi(
      createApiJson([authorizeGatewayConfigWithApplePay]),
    );

    expect(api.json!.payment_gateways).toEqual([
      authorizeGatewayConfigWithApplePay,
    ]);
    expect(api.paymentOptions).toEqual([applePayOption, cardOption]);

    await rejectApplePayScriptLoad();
    await flushTasks();

    expect(api.json!.payment_gateways).toEqual([
      authorizeGatewayConfigWithApplePay,
    ]);
    expect(api.paymentOptions).toEqual([cardOption]);
    expect(warnSpy).toHaveBeenCalledWith(
      "Apple Pay payment options were removed because Apple Pay is not available in this browser.",
    );
  });

  it.skip("waits for the first Apple Pay SDK load before keeping available Apple Pay options", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = createTestApi(
      createApiJson([authorizeGatewayConfigWithApplePay]),
    );

    expect(api.json!.payment_gateways).toEqual([
      authorizeGatewayConfigWithApplePay,
    ]);
    expect(api.paymentOptions).toEqual([applePayOption, cardOption]);

    await resolveApplePayScriptLoad(true);

    expect(api.json!.payment_gateways).toEqual([
      authorizeGatewayConfigWithApplePay,
    ]);
    expect(api.paymentOptions).toEqual([applePayOption, cardOption]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.skip("waits for first Apple Pay SDK load before replacing stored JSON", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const api = createTestApi(createApiJson([authorizeGatewayConfig]));

    const replacePromise = api.replaceJsonForTesting(
      createApiJson([authorizeGatewayConfigWithApplePay]),
    );

    expect(api.json!.payment_gateways).toEqual([authorizeGatewayConfig]);
    expect(api.paymentOptions).toEqual([cardOption]);

    await resolveApplePayScriptLoad(true);
    await replacePromise;

    expect(api.json!.payment_gateways).toEqual([
      authorizeGatewayConfigWithApplePay,
    ]);
    expect(api.paymentOptions).toEqual([applePayOption, cardOption]);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
