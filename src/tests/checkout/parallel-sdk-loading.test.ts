/**
 * @vitest-environment jsdom
 */

import type { APIJson } from "../../checkout/types";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

const mocks = vi.hoisted(() => {
  function createDeferred<T>(): Deferred<T> {
    let resolve!: Deferred<T>["resolve"];
    let reject!: Deferred<T>["reject"];
    const promise = new Promise<T>((nextResolve, nextReject) => {
      resolve = nextResolve;
      reject = nextReject;
    });

    return { promise, resolve, reject };
  }

  const payPalSdk = {
    findEligibleMethods: vi.fn(),
    updateLocale: vi.fn(),
  };

  const klarnaSdk = {
    Payments: {
      init: vi.fn(),
      load: vi.fn(),
      loadPaymentReview: vi.fn(),
      authorize: vi.fn(),
      reauthorize: vi.fn(),
      finalize: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
  };

  const sezzleSdk = {
    init: vi.fn(),
    startCheckout: vi.fn(),
    renderSezzleButton: vi.fn(),
    capturePayment: vi.fn(),
    getInstallmentPlan: vi.fn(),
  };

  const state = {
    payPalCalls: [] as string[],
    payPalDeferreds: [] as Array<
      Deferred<{ paypal: unknown; options: unknown[] }>
    >,
    klarnaDeferred: createDeferred<unknown>(),
    sezzleDeferred: createDeferred<unknown>(),
    applePayDeferred: createDeferred<void>(),
    googlePayDeferred: createDeferred<void>(),
    payPalSdk,
    klarnaSdk,
    sezzleSdk,
    discoverPayPalPaymentOptions: vi.fn((params: { clientId: string }) => {
      const deferred = createDeferred<{
        paypal: unknown;
        options: unknown[];
      }>();

      state.payPalCalls.push(params.clientId);
      state.payPalDeferreds.push(deferred);

      return deferred.promise;
    }),
    initializeKlarnaSdk: vi.fn(() => state.klarnaDeferred.promise),
    initializeSezzleSdk: vi.fn(() => state.sezzleDeferred.promise),
    loadApplePaySdk: vi.fn(() => state.applePayDeferred.promise),
    loadGooglePaySdk: vi.fn(() => state.googlePayDeferred.promise),
    getApplePayAvailability: vi.fn(() => "available" as const),
    createGooglePaymentsClient: vi.fn(),
    canMakeGooglePayPayments: vi.fn(),
    reset(): void {
      state.payPalCalls = [];
      state.payPalDeferreds = [];
      state.klarnaDeferred = createDeferred<unknown>();
      state.sezzleDeferred = createDeferred<unknown>();
      state.applePayDeferred = createDeferred<void>();
      state.googlePayDeferred = createDeferred<void>();
      state.discoverPayPalPaymentOptions.mockClear();
      state.initializeKlarnaSdk.mockClear();
      state.initializeSezzleSdk.mockClear();
      state.loadApplePaySdk.mockClear();
      state.loadGooglePaySdk.mockClear();
      state.getApplePayAvailability.mockClear();
      state.createGooglePaymentsClient.mockClear();
      state.canMakeGooglePayPayments.mockClear();
      state.payPalSdk.findEligibleMethods.mockClear();
      state.payPalSdk.updateLocale.mockClear();
      state.klarnaSdk.Payments.init.mockClear();
      state.klarnaSdk.Payments.load.mockClear();
      state.klarnaSdk.Payments.loadPaymentReview.mockClear();
      state.klarnaSdk.Payments.authorize.mockClear();
      state.klarnaSdk.Payments.reauthorize.mockClear();
      state.klarnaSdk.Payments.finalize.mockClear();
      state.klarnaSdk.Payments.on.mockClear();
      state.klarnaSdk.Payments.off.mockClear();
      state.sezzleSdk.init.mockClear();
      state.sezzleSdk.startCheckout.mockClear();
      state.sezzleSdk.renderSezzleButton.mockClear();
      state.sezzleSdk.capturePayment.mockClear();
      state.sezzleSdk.getInstallmentPlan.mockClear();
    },
  };

  state.reset();

  return state;
});

vi.mock("../../checkout/utils/payPal", () => ({
  discoverPayPalPaymentOptions: mocks.discoverPayPalPaymentOptions,
}));

vi.mock("../../checkout/utils/klarna", () => ({
  initializeKlarnaSdk: mocks.initializeKlarnaSdk,
}));

vi.mock("../../checkout/utils/sezzle", () => ({
  initializeSezzleSdk: mocks.initializeSezzleSdk,
}));

vi.mock("../../checkout/utils/applePay", () => ({
  getApplePayAvailability: mocks.getApplePayAvailability,
  loadApplePaySdk: mocks.loadApplePaySdk,
}));

vi.mock("../../checkout/utils/googlePay", () => ({
  canMakeGooglePayPayments: mocks.canMakeGooglePayPayments,
  createGooglePaymentsClient: mocks.createGooglePaymentsClient,
  loadGooglePaySdk: mocks.loadGooglePaySdk,
}));

const cardOption = { type: "new-card", gateway: "stripe" } as const;
const klarnaOption = {
  type: "klarna",
  gateway: "klarna",
  session_id: "klarna-session-id",
  client_token: "klarna-client-token",
  payment_method_categories: [],
} as const;
const sezzleOption = {
  type: "sezzle",
  public_key: "sezzle-public-key",
} as const;
const payPalOptionOne = {
  type: "paypal",
  gateway: "paypal_platform",
  client_id: "paypal-client-id-1",
} as const;
const payPalOptionTwo = {
  type: "paypal",
  gateway: "paypal_platform",
  client_id: "paypal-client-id-2",
} as const;
const discoveredApplePayOption = {
  type: "apple-pay",
  gateway: "paypal_platform",
  client_id: "paypal-client-id-1",
} as const;
const discoveredGooglePayOption = {
  type: "google-pay",
  gateway: "paypal_platform",
  client_id: "paypal-client-id-2",
  merchant_id: "merchant-id",
  gateway_parameters: { gateway: "paypal" },
} as const;

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

async function createTestApi() {
  const { API } = await import("../../checkout/API");

  class TestHttpCheckoutAPI extends API {
    async replaceJsonForTesting(nextJson: APIJson): Promise<void> {
      await this.replaceJson(nextJson);
    }
  }

  return new TestHttpCheckoutAPI();
}

describe("resolveIncomingApiState", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.reset();
  });

  it("loads third-party SDKs in parallel after PayPal discovery", async () => {
    const api = await createTestApi();
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([
        payPalOptionOne,
        klarnaOption,
        sezzleOption,
        payPalOptionTwo,
        cardOption,
      ]),
    );

    await flushTasks();

    expect(mocks.discoverPayPalPaymentOptions).toHaveBeenCalledTimes(2);
    expect(mocks.payPalCalls).toEqual([
      payPalOptionOne.client_id,
      payPalOptionTwo.client_id,
    ]);
    expect(mocks.initializeKlarnaSdk).not.toHaveBeenCalled();
    expect(mocks.initializeSezzleSdk).not.toHaveBeenCalled();
    expect(mocks.loadApplePaySdk).not.toHaveBeenCalled();
    expect(mocks.loadGooglePaySdk).not.toHaveBeenCalled();

    mocks.payPalDeferreds[0]?.resolve({
      paypal: mocks.payPalSdk,
      options: [discoveredApplePayOption],
    });
    mocks.payPalDeferreds[1]?.resolve({
      paypal: null,
      options: [discoveredGooglePayOption],
    });

    await flushTasks();

    expect(mocks.initializeKlarnaSdk).toHaveBeenCalledTimes(1);
    expect(mocks.initializeSezzleSdk).toHaveBeenCalledTimes(1);
    expect(mocks.loadApplePaySdk).toHaveBeenCalledTimes(1);
    expect(mocks.loadGooglePaySdk).toHaveBeenCalledTimes(1);

    mocks.klarnaDeferred.resolve(mocks.klarnaSdk);
    mocks.sezzleDeferred.resolve(mocks.sezzleSdk);
    mocks.applePayDeferred.resolve();
    mocks.googlePayDeferred.resolve();

    await replacePromise;

    expect(api.paypal).toBe(mocks.payPalSdk);
    expect(api.klarna).toBe(mocks.klarnaSdk);
    expect(api.sezzle).toBe(mocks.sezzleSdk);
    expect(api.json?.payment_options).toEqual([
      payPalOptionOne,
      discoveredApplePayOption,
      klarnaOption,
      sezzleOption,
      payPalOptionTwo,
      discoveredGooglePayOption,
      cardOption,
    ]);
  });
});
