/**
 * @vitest-environment jsdom
 */

import type {
  APIJson,
  AdyenEmbeddedPaymentMethod,
  AdyenEmbeddedSdkInstance,
  AdyenEmbeddedSdkNamespace,
} from "../../checkout/types";

const ADYEN_JS_API_URL =
  "https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/sdk/6.36.0/adyen.js";
const APPLE_PAY_JS_API_URL =
  "https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js";

type AdyenWindow = Window & {
  AdyenWeb?: AdyenEmbeddedSdkNamespace;
  ApplePaySession?: { canMakePayments?: () => boolean };
};

const authorizeGatewayConfig = { type: "authorize" } as const;
const adyenGatewayConfig = {
  type: "adyen_embedded",
  payment_methods_response: {
    paymentMethods: [
      { type: "scheme", name: "Cards" },
      { type: "eps", name: "EPS" },
    ],
  },
  environment: "test",
  client_key: "test_870be2_client_key",
} as const;
const hadWindow = "window" in globalThis;
const hadDocument = "document" in globalThis;
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalAdyenWeb = (originalWindow as AdyenWindow).AdyenWeb;
const hadApplePaySession = "ApplePaySession" in (originalWindow as AdyenWindow);
const originalApplePaySession = (originalWindow as AdyenWindow).ApplePaySession;

function getAdyenScript(): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(`script[src="${ADYEN_JS_API_URL}"]`);
}

function getApplePayScript(): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(`script[src="${APPLE_PAY_JS_API_URL}"]`);
}

function flushTasks(): Promise<void> {
  return Promise.resolve()
    .then(() => Promise.resolve())
    .then(() => undefined);
}

function createApiJson(
  payment_gateways?: APIJson["payment_gateways"],
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

  Reflect.deleteProperty(originalWindow as AdyenWindow, "AdyenWeb");

  if (applePayAvailable === undefined) {
    Reflect.deleteProperty(originalWindow as AdyenWindow, "ApplePaySession");
    return;
  }

  (originalWindow as AdyenWindow).ApplePaySession = {
    canMakePayments: vi.fn(() => applePayAvailable),
  };
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

  if (originalAdyenWeb) {
    (originalWindow as AdyenWindow).AdyenWeb = originalAdyenWeb;
  } else {
    Reflect.deleteProperty(originalWindow as AdyenWindow, "AdyenWeb");
  }

  if (hadApplePaySession) {
    (originalWindow as AdyenWindow).ApplePaySession = originalApplePaySession;
  } else {
    Reflect.deleteProperty(originalWindow as AdyenWindow, "ApplePaySession");
  }
}

function createAdyenCheckoutInstance(
  paymentMethods: AdyenEmbeddedPaymentMethod[] = [
    { type: "scheme", name: "Cards" },
    { type: "eps", name: "EPS" },
  ],
): AdyenEmbeddedSdkInstance {
  let checkout!: AdyenEmbeddedSdkInstance;
  const update = vi.fn(async () => checkout);

  checkout = {
    paymentMethodsResponse: {
      paymentMethods,
      storedPaymentMethods: [],
    },
    createFromAction: vi.fn(),
    update,
  } as AdyenEmbeddedSdkInstance;

  return checkout;
}

function setLoadedAdyen(
  construct: (
    configuration: Record<string, unknown>,
  ) => AdyenEmbeddedSdkInstance | Promise<AdyenEmbeddedSdkInstance> = () =>
    createAdyenCheckoutInstance(),
): {
  AdyenCheckout: ReturnType<typeof vi.fn>;
  getLastConfiguration: () => Record<string, unknown> | null;
  getLastInstance: () => AdyenEmbeddedSdkInstance | null;
} {
  let lastConfiguration: Record<string, unknown> | null = null;
  let lastInstance: AdyenEmbeddedSdkInstance | null = null;

  const AdyenCheckout = vi.fn(
    async (configuration: Record<string, unknown>) => {
      lastConfiguration = configuration;
      lastInstance = await construct(configuration);

      return lastInstance;
    },
  );

  (window as AdyenWindow).AdyenWeb = {
    AdyenCheckout,
  } satisfies AdyenEmbeddedSdkNamespace;

  return {
    AdyenCheckout,
    getLastConfiguration: () => lastConfiguration,
    getLastInstance: () => lastInstance,
  };
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

describe("Adyen Embedded payment option loading", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    getAdyenScript()?.remove();
    getApplePayScript()?.remove();
    restoreRuntime();
  });

  it("loads the Adyen SDK script when Adyen appears in payment options", async () => {
    setBrowserRuntime();

    await createTestApi(
      createApiJson([adyenGatewayConfig, authorizeGatewayConfig]),
    );

    expect(getAdyenScript()?.src).toBe(ADYEN_JS_API_URL);

    setLoadedAdyen();
    getAdyenScript()?.dispatchEvent(new Event("load"));
    await flushTasks();
  });

  it("does not load the Adyen SDK script when Adyen is absent", async () => {
    setBrowserRuntime();

    await createTestApi(createApiJson([authorizeGatewayConfig]));

    expect(getAdyenScript()).toBeNull();
  });

  it("does not duplicate the Adyen SDK script across API instances", async () => {
    setBrowserRuntime();

    const firstApi = await createTestApi(
      createApiJson([authorizeGatewayConfig]),
    );
    const secondApi = await createTestApi(
      createApiJson([authorizeGatewayConfig]),
    );
    const firstReplacePromise = firstApi.replaceJsonForTesting(
      createApiJson([adyenGatewayConfig, authorizeGatewayConfig]),
    );
    const secondReplacePromise = secondApi.replaceJsonForTesting(
      createApiJson([adyenGatewayConfig, authorizeGatewayConfig]),
    );

    expect(
      document.querySelectorAll(`script[src="${ADYEN_JS_API_URL}"]`),
    ).toHaveLength(1);

    setLoadedAdyen();
    getAdyenScript()?.dispatchEvent(new Event("load"));
    await Promise.all([firstReplacePromise, secondReplacePromise]);

    expect(firstApi.adyenEmbedded).not.toBeNull();
    expect(firstApi.adyenEmbedded).toBe(secondApi.adyenEmbedded);
  });

  it("publishes raw JSON before Adyen readiness and exposes the SDK instance", async () => {
    setBrowserRuntime(true);

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([adyenGatewayConfig, authorizeGatewayConfig]),
    );
    let didReplaceResolve = false;

    void replacePromise.then(() => {
      didReplaceResolve = true;
    });

    expect(api.json!.payment_gateways).toEqual([
      adyenGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.adyenEmbedded).toBeNull();
    expect(didReplaceResolve).toBe(false);

    const paymentMethods: AdyenEmbeddedPaymentMethod[] = [
      { type: "scheme", name: "Cards" },
      { type: "bankTransfer_IBAN", name: "Bank transfer IBAN" },
      { type: "redirect", name: "Redirect" },
      { type: "bankTransfer_AE", name: "Bank transfer AE" },
      { type: "dragonpay", name: "Dragonpay" },
      { type: "eps", name: "EPS" },
      { type: "applepay", name: "Apple Pay" },
    ];
    const { AdyenCheckout, getLastConfiguration, getLastInstance } =
      setLoadedAdyen(() => createAdyenCheckoutInstance(paymentMethods));

    getAdyenScript()?.dispatchEvent(new Event("load"));
    await replacePromise;

    expect(AdyenCheckout).toHaveBeenCalledTimes(1);
    expect(getLastConfiguration()).toEqual({
      paymentMethodsResponse: adyenGatewayConfig.payment_methods_response,
      environment: adyenGatewayConfig.environment,
      amount: { value: 1234, currency: "USD" },
      countryCode: "US",
      clientKey: adyenGatewayConfig.client_key,
      locale: "en-US",
    });
    expect(api.json!.payment_gateways).toEqual([
      adyenGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.adyenEmbedded?.paymentMethodsResponse.paymentMethods).toEqual(
      paymentMethods,
    );
    expect(api.adyenEmbedded).toBe(getLastInstance());
  });

  it("normalizes a POSIX-form locale code before passing it to Adyen", async () => {
    setBrowserRuntime();

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const replacePromise = api.replaceJsonForTesting({
      ...createApiJson([adyenGatewayConfig, authorizeGatewayConfig]),
      format: { ...createApiJson().format, locale_code: "en_US" },
    });

    const { getLastConfiguration } = setLoadedAdyen(() =>
      createAdyenCheckoutInstance(),
    );

    getAdyenScript()?.dispatchEvent(new Event("load"));
    await replacePromise;

    expect(getLastConfiguration()?.locale).toBe("en-US");
  });

  it("exposes Adyen checkout instances with additional documented payment methods", async () => {
    setBrowserRuntime();

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([adyenGatewayConfig, authorizeGatewayConfig]),
    );

    const paymentMethods: AdyenEmbeddedPaymentMethod[] = [
      { type: "alipay", name: "Alipay" },
      { type: "ebanking_FI", name: "Online banking Finland" },
      { type: "molpay_boost", name: "Boost" },
      { type: "payme", name: "PayMe" },
      { type: "kcp_payco", name: "PayCo" },
      { type: "scalapay_3x", name: "Scalapay" },
      { type: "grabpay_SG", name: "GrabPay" },
      { type: "zip", name: "Zip" },
    ];

    setLoadedAdyen(() => createAdyenCheckoutInstance(paymentMethods));

    getAdyenScript()?.dispatchEvent(new Event("load"));
    await replacePromise;

    expect(api.json!.payment_gateways).toEqual([
      adyenGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.adyenEmbedded?.paymentMethodsResponse.paymentMethods).toEqual(
      paymentMethods,
    );
  });

  it("keeps the raw Adyen gateway when the Adyen client key is missing", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const { client_key: _ignoredClientKey, ...optionWithoutClientKey } =
      adyenGatewayConfig;
    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([
        optionWithoutClientKey as unknown as typeof adyenGatewayConfig,
        authorizeGatewayConfig,
      ]),
    );
    setLoadedAdyen();

    getAdyenScript()?.dispatchEvent(new Event("load"));
    await replacePromise;

    expect(api.json!.payment_gateways).toEqual([
      optionWithoutClientKey as unknown as typeof adyenGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.adyenEmbedded).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Adyen Embedded SDK was not initialized because the Adyen SDK could not be loaded.",
    );
  });

  it("keeps the raw Adyen gateway when the Adyen SDK script fails to load", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([adyenGatewayConfig, authorizeGatewayConfig]),
    );

    getAdyenScript()?.dispatchEvent(new Event("error"));
    await replacePromise;

    expect(api.json!.payment_gateways).toEqual([
      adyenGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.adyenEmbedded).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Adyen Embedded SDK was not initialized because the Adyen SDK could not be loaded.",
    );
  });

  it("keeps the raw Adyen gateway when Adyen initialization fails", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([adyenGatewayConfig, authorizeGatewayConfig]),
    );

    setLoadedAdyen(async () => {
      throw new Error("Adyen init failed.");
    });
    getAdyenScript()?.dispatchEvent(new Event("load"));
    await replacePromise;

    expect(api.json!.payment_gateways).toEqual([
      adyenGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.adyenEmbedded).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Adyen Embedded SDK was not initialized because the Adyen SDK could not be loaded.",
    );
  });
});

describe("submitAdyenEmbeddedPayment", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRuntime();
  });

  it("posts payment data as JSON to /helpers?action=submit_adyen_embedded_payment", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API({ storeDomain: "store.test" });

    const paymentData = {
      paymentMethod: { type: "scheme", encryptedCardNumber: "abc" },
    };
    const mockResponse = { resultCode: "Authorised", pspReference: "PSP123" };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await api.submitAdyenEmbeddedPayment(paymentData);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe(
      "https://store.test/helpers?action=submit_adyen_embedded_payment",
    );
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ data: paymentData });
    expect(result).toEqual(mockResponse);
  });

  it("throws when the response is not ok", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API({ storeDomain: "store.test" });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("{}", { status: 422 }),
    );

    await expect(
      api.submitAdyenEmbeddedPayment({ paymentMethod: { type: "scheme" } }),
    ).rejects.toThrow("HTTP status 422");
  });

  it("throws when storeDomain is not set", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API();

    await expect(
      api.submitAdyenEmbeddedPayment({ paymentMethod: { type: "scheme" } }),
    ).rejects.toThrow();
  });
});

describe("submitAdyenEmbeddedPaymentDetails", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRuntime();
  });

  it("posts details as JSON to /helpers?action=submit_adyen_embedded_payment_details", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API({ storeDomain: "store.test" });

    const detailsData = {
      details: { redirectResult: "eyJ..." },
      paymentData: "Ab02b4c...",
    };
    const mockResponse = { resultCode: "Authorised", pspReference: "PSP456" };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await api.submitAdyenEmbeddedPaymentDetails(detailsData);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe(
      "https://store.test/helpers?action=submit_adyen_embedded_payment_details",
    );
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ data: detailsData });
    expect(result).toEqual(mockResponse);
  });

  it("throws when the response is not ok", async () => {
    setBrowserRuntime();
    const { API } = await import("../../checkout/API");
    const api = new API({ storeDomain: "store.test" });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("{}", { status: 500 }),
    );

    await expect(
      api.submitAdyenEmbeddedPaymentDetails({ details: {} }),
    ).rejects.toThrow("HTTP status 500");
  });
});
