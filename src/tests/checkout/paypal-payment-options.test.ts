/**
 * @vitest-environment jsdom
 */

import type { APIJson } from "../../checkout/types";
import type { PayPalSdkInstance } from "../../checkout/types/PayPalSdkInstance";

const sdkV6Mock = vi.hoisted(() => ({
  loadCoreSdkScript: vi.fn(),
}));

vi.mock("@paypal/paypal-js/sdk-v6", () => ({
  loadCoreSdkScript: sdkV6Mock.loadCoreSdkScript,
}));

type RuntimeGlobals = typeof globalThis & {
  ApplePaySession?: { canMakePayments?: () => boolean };
};

type PayPalFundingSource =
  | "advanced_cards"
  | "applepay"
  | "googlepay"
  | "paylater"
  | "credit"
  | "venmo"
  | "bancontact"
  | "ideal"
  | "eps"
  | "blik"
  | "p24";

type PayPalSessionCreatorName =
  | "createCardFieldsOneTimePaymentSession"
  | "createApplePayOneTimePaymentSession"
  | "createGooglePayOneTimePaymentSession"
  | "createPayLaterOneTimePaymentSession"
  | "createPayPalCreditOneTimePaymentSession"
  | "createVenmoOneTimePaymentSession"
  | "createBancontactOneTimePaymentSession"
  | "createIdealOneTimePaymentSession"
  | "createEpsOneTimePaymentSession"
  | "createBlikOneTimePaymentSession"
  | "createP24OneTimePaymentSession";

type BrowserRuntimeOptions = {
  applePayAvailable?: boolean;
  googlePayAvailable?: boolean;
};

const runtime = globalThis as RuntimeGlobals;

const cardOption = { type: "new-card", gateway: "authorize" } as const;
const authorizeGatewayConfig = { type: "authorize" } as const;
const paypalGatewayConfig = {
  type: "paypal_platform",
  client_id: "paypal-client-id",
} as const;
const paypalOption = {
  type: "paypal",
  gateway: "paypal_platform",
  client_id: "paypal-client-id",
} as const;

const hadWindow = "window" in globalThis;
const hadDocument = "document" in globalThis;
const hadApplePaySession = "ApplePaySession" in runtime;
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalApplePaySession = runtime.ApplePaySession;

function flushTasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
}

function createApiJson(
  payment_gateways?: APIJson["payment_gateways"],
  custom_config: APIJson["custom_config"] = {},
): APIJson {
  return {
    template_set: { code: "default", id: 1 },
    session: { id: "session-id" },
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
    custom_config,
    payment_gateways,
    language_strings: {},
  };
}

function setBrowserRuntime(options: BrowserRuntimeOptions = {}): void {
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

  if (options.applePayAvailable === undefined) {
    Reflect.deleteProperty(
      window as unknown as {
        ApplePaySession?: { canMakePayments?: () => boolean };
      },
      "ApplePaySession",
    );
  } else {
    (
      window as unknown as {
        ApplePaySession?: { canMakePayments?: () => boolean };
      }
    ).ApplePaySession = {
      canMakePayments: vi.fn(() => !!options.applePayAvailable),
    };
  }

  if (options.googlePayAvailable) {
    (window as Window & { google?: unknown }).google = {
      payments: {
        api: {
          PaymentsClient: vi.fn(),
        },
      },
    };
  } else {
    Reflect.deleteProperty(window as Window & { google?: unknown }, "google");
  }
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
    Reflect.deleteProperty(runtime, "ApplePaySession");
  }
}

function createGooglePayConfig() {
  return {
    eligible: true,
    merchantCountry: "US",
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["CRYPTOGRAM_3DS"],
          supportedNetworks: ["VISA"],
          billingAddressRequired: true,
          assuranceDetailsRequired: true,
          billingAddressParameters: {
            format: "FULL",
            phoneNumberRequired: true,
          },
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "paypal",
            gatewayMerchantId: "paypal-google-gateway-id",
          },
        },
      },
    ],
    merchantInfo: {
      merchantOrigin: "https://example.com",
      merchantId: "google-merchant-id",
    },
  };
}

function createEligibility(eligibleSources: PayPalFundingSource[]) {
  const eligible = new Set(eligibleSources);
  const googlePayConfig = createGooglePayConfig();

  return {
    isEligible: vi.fn((fundingSource: string) =>
      eligible.has(fundingSource as PayPalFundingSource),
    ),
    getDetails: vi.fn((fundingSource: string) => {
      if (fundingSource === "googlepay") {
        return { config: googlePayConfig };
      }

      return { canBeVaulted: false };
    }),
  };
}

const sessionCreatorsByFundingSource: Record<
  PayPalFundingSource,
  PayPalSessionCreatorName
> = {
  advanced_cards: "createCardFieldsOneTimePaymentSession",
  applepay: "createApplePayOneTimePaymentSession",
  googlepay: "createGooglePayOneTimePaymentSession",
  paylater: "createPayLaterOneTimePaymentSession",
  credit: "createPayPalCreditOneTimePaymentSession",
  venmo: "createVenmoOneTimePaymentSession",
  bancontact: "createBancontactOneTimePaymentSession",
  ideal: "createIdealOneTimePaymentSession",
  eps: "createEpsOneTimePaymentSession",
  blik: "createBlikOneTimePaymentSession",
  p24: "createP24OneTimePaymentSession",
};

function createPayPalInstance(
  eligibleSources: PayPalFundingSource[],
  availableSessionSources: PayPalFundingSource[] = eligibleSources,
): PayPalSdkInstance {
  const paypal = {
    findEligibleMethods: vi.fn(async () => createEligibility(eligibleSources)),
    updateLocale: vi.fn(),
  } as Record<string, unknown>;

  for (const source of availableSessionSources) {
    paypal[sessionCreatorsByFundingSource[source]] = vi.fn(() => ({}));
  }

  return paypal as unknown as PayPalSdkInstance;
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

async function createTestApi(json: APIJson) {
  const { API } = await import("../../checkout/API");

  class TestHttpCheckoutAPI extends API {
    async replaceJsonForTesting(nextJson: APIJson): Promise<void> {
      await this.replaceJson(nextJson);
    }
  }

  return new TestHttpCheckoutAPI({
    initialJson: json,
    storeDomain: "store.test",
  });
}

describe("PayPal payment option discovery", () => {
  beforeEach(() => {
    vi.resetModules();
    sdkV6Mock.loadCoreSdkScript.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRuntime();
  });

  it("does not load the PayPal SDK when paypal_platform is absent", async () => {
    setBrowserRuntime();

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));

    await vi.dynamicImportSettled();
    await flushTasks();

    expect(api.paypal).toBeNull();
    expect(sdkV6Mock.loadCoreSdkScript).not.toHaveBeenCalled();
  });

  it("publishes checkout JSON as soon as PayPal SDK initialization settles", async () => {
    setBrowserRuntime();
    const paypal = createPayPalInstance(["advanced_cards"]);
    const createInstance = vi.fn(async () => paypal);
    const sdkDeferred = createDeferred<{
      createInstance: typeof createInstance;
      version: string;
    }>();

    sdkV6Mock.loadCoreSdkScript.mockReturnValue(sdkDeferred.promise);

    const { API } = await import("../../checkout/API");
    const api = new API();
    const updateListener = vi.fn();

    api.addEventListener("update", updateListener);

    const hydratePromise = api.hydrateJson(
      createApiJson([paypalGatewayConfig]),
      { state: "idle" },
    );

    await vi.dynamicImportSettled();
    await flushTasks();

    expect(api.json).toBeNull();
    expect(api.paypal).toBeNull();
    expect(updateListener).not.toHaveBeenCalled();
    expect(sdkV6Mock.loadCoreSdkScript).toHaveBeenCalledTimes(1);

    let didHydrateResolve = false;
    void hydratePromise.then(() => {
      didHydrateResolve = true;
    });

    await flushTasks();

    expect(didHydrateResolve).toBe(false);

    sdkDeferred.resolve({ createInstance, version: "6.0.0" });

    await hydratePromise;

    expect(api.json?.payment_gateways).toEqual([paypalGatewayConfig]);
    expect(api.paypal).toBe(paypal);
    expect(updateListener).toHaveBeenCalledTimes(1);
  });

  it("discovers PayPal v6 payment options and exposes the resolved options alongside the SDK instance", async () => {
    setBrowserRuntime({ applePayAvailable: true, googlePayAvailable: true });
    const paypal = createPayPalInstance([
      "advanced_cards",
      "applepay",
      "googlepay",
      "paylater",
      "credit",
      "venmo",
      "bancontact",
      "ideal",
      "eps",
      "blik",
      "p24",
    ]);
    const createInstance = vi.fn(async () => paypal);

    sdkV6Mock.loadCoreSdkScript.mockResolvedValue({
      createInstance,
      version: "6.0.0",
    });

    const { discoverPayPalPaymentOptions } =
      await import("../../checkout/utils/payPal");

    const result = await discoverPayPalPaymentOptions({
      clientId: paypalOption.client_id,
      customConfig: { paypal_environment: "sandbox" },
      amount: "12.34",
      currencyCode: "USD",
      locale: "en-US",
      buyerCountry: "US",
    });

    expect(result.paypal).toBe(paypal);
    expect(createInstance).toHaveBeenCalledWith({
      clientId: paypalOption.client_id,
      components: [
        "paypal-payments",
        "card-fields",
        "venmo-payments",
        "applepay-payments",
        "googlepay-payments",
        "bancontact-payments",
        "ideal-payments",
        "eps-payments",
        "blik-payments",
        "p24-payments",
      ],
      locale: "en-US",
      pageType: "checkout",
      testBuyerCountry: "US",
    });
    expect(paypal.findEligibleMethods).toHaveBeenCalledWith({
      paymentFlow: "ONE_TIME_PAYMENT",
      amount: "12.34",
      currencyCode: "USD",
    });
    expect(result.options).toEqual([
      {
        type: "new-card",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
      {
        type: "apple-pay",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
      {
        type: "google-pay",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
        merchant_id: "google-merchant-id",
        gateway_parameters: {
          gateway: "paypal",
          gatewayMerchantId: "paypal-google-gateway-id",
        },
      },
      {
        type: "paypal-pay-later",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
      {
        type: "paypal-credit",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
      {
        type: "venmo",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
      {
        type: "bancontact",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
      {
        type: "ideal",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
      {
        type: "eps",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
      {
        type: "blik",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
      {
        type: "przelewy24",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
    ]);
  });

  it("requires the matching PayPal session creator before surfacing undocumented APMs", async () => {
    setBrowserRuntime();
    const paypal = createPayPalInstance(
      ["bancontact", "ideal", "eps", "blik", "p24"],
      [],
    );

    sdkV6Mock.loadCoreSdkScript.mockResolvedValue({
      createInstance: vi.fn(async () => paypal),
      version: "6.0.0",
    });

    const { discoverPayPalPaymentOptions } =
      await import("../../checkout/utils/payPal");

    const result = await discoverPayPalPaymentOptions({
      clientId: paypalOption.client_id,
      customConfig: { paypal_environment: "sandbox" },
    });

    expect(result.paypal).toBe(paypal);
    expect(result.options).toEqual([]);
  });

  it("reports Apple Pay discovery before browser-specific filtering", async () => {
    setBrowserRuntime({ applePayAvailable: false });
    const paypal = createPayPalInstance(["applepay"]);

    sdkV6Mock.loadCoreSdkScript.mockResolvedValue({
      createInstance: vi.fn(async () => paypal),
      version: "6.0.0",
    });

    const { discoverPayPalPaymentOptions } =
      await import("../../checkout/utils/payPal");

    const result = await discoverPayPalPaymentOptions({
      clientId: paypalOption.client_id,
      customConfig: { paypal_environment: "sandbox" },
    });

    expect(result.paypal).toBe(paypal);
    expect(result.options).toEqual([
      {
        type: "apple-pay",
        gateway: "paypal_platform",
        client_id: paypalOption.client_id,
      },
    ]);
  });

  it("emits a follow-up update when later provider SDK initialization changes only provider handles", async () => {
    setBrowserRuntime();
    const paypal = createPayPalInstance(["advanced_cards"]);
    const createInstance = vi.fn(async () => paypal);
    const sdkDeferred = createDeferred<{
      createInstance: typeof createInstance;
      version: string;
    }>();

    sdkV6Mock.loadCoreSdkScript.mockReturnValue(sdkDeferred.promise);

    const { API } = await import("../../checkout/API");
    const api = new API();
    const updateListener = vi.fn();

    api.addEventListener("update", updateListener);

    const hydratePromise = api.hydrateJson(
      createApiJson([paypalGatewayConfig], {
        paypal_environment: "sandbox",
      }),
      { state: "idle" },
    );

    await vi.dynamicImportSettled();
    await flushTasks();

    expect(api.json).toBeNull();
    expect(api.paypal).toBeNull();
    expect(updateListener).not.toHaveBeenCalled();

    sdkDeferred.resolve({ createInstance, version: "6.0.0" });

    await hydratePromise;

    expect(api.json?.payment_gateways).toEqual([paypalGatewayConfig]);
    expect(api.paypal).toBe(paypal);
    expect(updateListener).toHaveBeenCalledTimes(1);
  });

  it("updates stored JSON only after PayPal SDK initialization resolves", async () => {
    setBrowserRuntime();
    const paypal = createPayPalInstance(["advanced_cards"]);
    const createInstance = vi.fn(async () => paypal);
    const sdkDeferred = createDeferred<{
      createInstance: typeof createInstance;
      version: string;
    }>();

    sdkV6Mock.loadCoreSdkScript.mockReturnValue(sdkDeferred.promise);

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));

    await vi.dynamicImportSettled();
    await flushTasks();

    const updateSpy = vi.fn();
    api.addEventListener("update", updateSpy);

    const replacePromise = api.replaceJsonForTesting(
      createApiJson([paypalGatewayConfig], { paypal_environment: "sandbox" }),
    );

    let didReplaceResolve = false;
    void replacePromise.then(() => {
      didReplaceResolve = true;
    });

    await vi.dynamicImportSettled();
    await flushTasks();

    expect(api.json?.payment_gateways).toEqual([authorizeGatewayConfig]);
    expect(api.paypal).toBeNull();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(didReplaceResolve).toBe(false);

    sdkDeferred.resolve({ createInstance, version: "6.0.0" });

    await replacePromise;

    expect(api.json?.payment_gateways).toEqual([paypalGatewayConfig]);
    expect(api.paypal).toBe(paypal);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it("does not hang forever when PayPal instance creation never settles", async () => {
    vi.useFakeTimers();

    try {
      setBrowserRuntime();
      const createInstance = vi.fn(
        () => new Promise<PayPalSdkInstance>(() => undefined),
      );

      sdkV6Mock.loadCoreSdkScript.mockResolvedValue({
        createInstance,
        version: "6.0.0",
      });

      const { API } = await import("../../checkout/API");
      const api = new API();
      const updateSpy = vi.fn();

      api.addEventListener("update", updateSpy);

      const hydratePromise = api.hydrateJson(
        createApiJson([paypalGatewayConfig], { paypal_environment: "sandbox" }),
        { state: "idle" },
      );

      let didHydrateResolve = false;
      void hydratePromise.then(() => {
        didHydrateResolve = true;
      });

      await vi.dynamicImportSettled();
      await flushTasks();

      expect(api.json).toBeNull();
      expect(api.paypal).toBeNull();
      expect(didHydrateResolve).toBe(false);

      await vi.runAllTimersAsync();
      await hydratePromise;

      expect(createInstance).toHaveBeenCalledTimes(1);
      expect(api.json?.payment_gateways).toEqual([paypalGatewayConfig]);
      expect(api.paypal).toBeNull();
      expect(updateSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the server-sent PayPal gateway when the SDK fails to initialize", async () => {
    setBrowserRuntime();
    sdkV6Mock.loadCoreSdkScript.mockRejectedValue(new Error("boom"));

    const api = await createTestApi(
      createApiJson([paypalGatewayConfig], { paypal_environment: "sandbox" }),
    );

    await vi.dynamicImportSettled();
    await flushTasks();

    expect(api.paypal).toBeNull();
    expect(api.json?.payment_gateways).toEqual([paypalGatewayConfig]);
  });
});
