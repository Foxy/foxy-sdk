/**
 * @vitest-environment jsdom
 */

import type {
  APIJson,
  AdyenEmbeddedPaymentMethod,
  AdyenEmbeddedSdkInstance,
  AdyenEmbeddedSdkNamespace,
  PaymentOption,
} from "../../checkout/types";

const ADYEN_JS_API_URL =
  "https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/sdk/6.36.0/adyen.js";
const APPLE_PAY_JS_API_URL =
  "https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js";

type AdyenPaymentOption = Extract<
  PaymentOption,
  { type: "adyen_embedded"; gateway: "adyen_embedded" }
>;

type AdyenWindow = Window & {
  AdyenWeb?: AdyenEmbeddedSdkNamespace;
  ApplePaySession?: { canMakePayments?: () => boolean };
};

const cardOption = { type: "new-card", gateway: "authorize" } as const;
const adyenOption: AdyenPaymentOption = {
  type: "adyen_embedded",
  gateway: "adyen_embedded",
  session_id: "CSD9CAC34EBAE225DD",
  session_data: "Ab02b4c-session-data",
  environment: "test",
  client_key: "test_870be2_client_key",
};

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

function createApiJson(payment_options?: APIJson["payment_options"]): APIJson {
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
    payment_options,
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
    submitDetails: vi.fn(),
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

    await createTestApi(createApiJson([adyenOption, cardOption]));

    expect(getAdyenScript()?.src).toBe(ADYEN_JS_API_URL);

    setLoadedAdyen();
    getAdyenScript()?.dispatchEvent(new Event("load"));
    await flushTasks();
  });

  it("does not load the Adyen SDK script when Adyen is absent", async () => {
    setBrowserRuntime();

    await createTestApi(createApiJson([cardOption]));

    expect(getAdyenScript()).toBeNull();
  });

  it("does not duplicate the Adyen SDK script across API instances", async () => {
    setBrowserRuntime();

    const firstApi = await createTestApi(createApiJson([cardOption]));
    const secondApi = await createTestApi(createApiJson([cardOption]));
    const firstReplacePromise = firstApi.replaceJsonForTesting(
      createApiJson([adyenOption, cardOption]),
    );
    const secondReplacePromise = secondApi.replaceJsonForTesting(
      createApiJson([adyenOption, cardOption]),
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

  it("waits for Adyen readiness before replacing stored JSON and exposes the SDK instance", async () => {
    setBrowserRuntime(true);

    const api = await createTestApi(createApiJson([cardOption]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([adyenOption, cardOption]),
    );

    expect(api.json!.payment_options).toEqual([cardOption]);
    expect(api.adyenEmbedded).toBeNull();

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
      session: {
        id: adyenOption.session_id,
        sessionData: adyenOption.session_data,
      },
      environment: adyenOption.environment,
      amount: { value: 1234, currency: "USD" },
      countryCode: "US",
      clientKey: adyenOption.client_key,
      locale: "en-US",
    });
    expect(api.json!.payment_options).toEqual([
      adyenOption,
      {
        type: "new-card",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "scheme",
      },
      {
        type: "bank-transfer",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "bankTransfer_IBAN",
        name: "Bank transfer IBAN",
        payment_method: paymentMethods[1],
      },
      {
        type: "redirect",
        gateway: "adyen_redirect",
        adyen_payment_method_type: "redirect",
        name: "Redirect",
        payment_method: paymentMethods[2],
      },
      {
        type: "eps",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "eps",
        name: "EPS",
        payment_method: paymentMethods[5],
      },
      {
        type: "apple-pay",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "applepay",
        name: "Apple Pay",
        payment_method: paymentMethods[6],
      },
      cardOption,
    ]);
    expect(getApplePayScript()?.src).toBe(APPLE_PAY_JS_API_URL);
    expect(api.adyenEmbedded).toBe(getLastInstance());
  });

  it("surfaces additional documented Adyen payment methods", async () => {
    setBrowserRuntime();

    const api = await createTestApi(createApiJson([cardOption]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([adyenOption, cardOption]),
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

    expect(api.json!.payment_options).toEqual([
      adyenOption,
      {
        type: "alipay",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "alipay",
        name: "Alipay",
        payment_method: paymentMethods[0],
      },
      {
        type: "online-banking",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "ebanking_FI",
        name: "Online banking Finland",
        payment_method: paymentMethods[1],
      },
      {
        type: "boost",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "molpay_boost",
        name: "Boost",
        payment_method: paymentMethods[2],
      },
      {
        type: "payme",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "payme",
        name: "PayMe",
        payment_method: paymentMethods[3],
      },
      {
        type: "payco",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "kcp_payco",
        name: "PayCo",
        payment_method: paymentMethods[4],
      },
      {
        type: "scalapay",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "scalapay_3x",
        name: "Scalapay",
        payment_method: paymentMethods[5],
      },
      {
        type: "grabpay",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "grabpay_SG",
        name: "GrabPay",
        payment_method: paymentMethods[6],
      },
      {
        type: "zip",
        gateway: "adyen_embedded",
        adyen_payment_method_type: "zip",
        name: "Zip",
        payment_method: paymentMethods[7],
      },
      cardOption,
    ]);
  });

  it("removes Adyen payment options when the Adyen client key is missing", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const { client_key: _ignoredClientKey, ...optionWithoutClientKey } =
      adyenOption;
    const api = await createTestApi(createApiJson([cardOption]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([
        optionWithoutClientKey as unknown as AdyenPaymentOption,
        cardOption,
      ]),
    );
    setLoadedAdyen();

    getAdyenScript()?.dispatchEvent(new Event("load"));
    await replacePromise;

    expect(api.json!.payment_options).toEqual([cardOption]);
    expect(api.adyenEmbedded).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Adyen Embedded payment options were removed because the Adyen SDK could not be loaded.",
    );
  });

  it("removes Adyen payment options when the Adyen SDK script fails to load", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = await createTestApi(createApiJson([cardOption]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([adyenOption, cardOption]),
    );

    getAdyenScript()?.dispatchEvent(new Event("error"));
    await replacePromise;

    expect(api.json!.payment_options).toEqual([cardOption]);
    expect(api.adyenEmbedded).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Adyen Embedded payment options were removed because the Adyen SDK could not be loaded.",
    );
  });

  it("removes Adyen payment options when Adyen initialization fails", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = await createTestApi(createApiJson([cardOption]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([adyenOption, cardOption]),
    );

    setLoadedAdyen(async () => {
      throw new Error("Adyen init failed.");
    });
    getAdyenScript()?.dispatchEvent(new Event("load"));
    await replacePromise;

    expect(api.json!.payment_options).toEqual([cardOption]);
    expect(api.adyenEmbedded).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Adyen Embedded payment options were removed because the Adyen SDK could not be loaded.",
    );
  });
});
