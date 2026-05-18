/**
 * @vitest-environment jsdom
 */

import type {
  APIJson,
  PaymentOption,
  SezzleSdkInstance,
} from "../../checkout/types";
import type { SezzleSdkConstructor } from "../../checkout/types/SezzleSdkInstance";

const SEZZLE_JS_API_URL = "https://checkout-sdk.sezzle.com/checkout.min.js";

type SezzlePaymentOption = Extract<PaymentOption, { type: "sezzle" }>;

type SezzleWindow = Window & {
  Checkout?: SezzleSdkConstructor;
};

const cardOption = { type: "new-card", gateway: "stripe" } as const;
const sezzleOption: SezzlePaymentOption = {
  type: "sezzle",
  public_key: "sezzle-public-key",
};

const hadWindow = "window" in globalThis;
const hadDocument = "document" in globalThis;
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalCheckout = (originalWindow as SezzleWindow).Checkout;

function getSezzleScript(): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(`script[src="${SEZZLE_JS_API_URL}"]`);
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

function setBrowserRuntime(): void {
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

  Reflect.deleteProperty(originalWindow as SezzleWindow, "Checkout");
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

  if (originalCheckout) {
    (originalWindow as SezzleWindow).Checkout = originalCheckout;
  } else {
    Reflect.deleteProperty(originalWindow as SezzleWindow, "Checkout");
  }
}

function setLoadedSezzle(
  construct: () => SezzleSdkInstance = () => {
    return {
      init: vi.fn(),
      startCheckout: vi.fn(),
      renderSezzleButton: vi.fn(),
      capturePayment: vi.fn(),
      getInstallmentPlan: vi.fn(),
    } satisfies SezzleSdkInstance;
  },
): {
  Checkout: ReturnType<typeof vi.fn>;
  getLastInstance: () => SezzleSdkInstance | null;
} {
  let lastInstance: SezzleSdkInstance | null = null;
  const Checkout = vi.fn(function Checkout() {
    lastInstance = construct();
    return lastInstance;
  });

  (window as SezzleWindow).Checkout =
    Checkout as unknown as SezzleSdkConstructor;

  return { Checkout, getLastInstance: () => lastInstance };
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

describe("Sezzle payment option loading", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    getSezzleScript()?.remove();
    restoreRuntime();
  });

  it("loads the Sezzle SDK script when Sezzle appears in payment options", async () => {
    setBrowserRuntime();

    await createTestApi(createApiJson([sezzleOption, cardOption]));

    const script = getSezzleScript();

    expect(script).not.toBeNull();
    expect(script?.src).toBe(SEZZLE_JS_API_URL);
  });

  it("does not load the Sezzle SDK script when Sezzle is absent", async () => {
    setBrowserRuntime();

    await createTestApi(createApiJson([cardOption]));

    expect(getSezzleScript()).toBeNull();
  });

  it("does not duplicate the Sezzle SDK script across API instances", async () => {
    setBrowserRuntime();

    const firstApi = await createTestApi(createApiJson([cardOption]));
    const secondApi = await createTestApi(createApiJson([cardOption]));
    const firstReplacePromise = firstApi.replaceJsonForTesting(
      createApiJson([sezzleOption, cardOption]),
    );
    const secondReplacePromise = secondApi.replaceJsonForTesting(
      createApiJson([sezzleOption, cardOption]),
    );

    expect(
      document.querySelectorAll(`script[src="${SEZZLE_JS_API_URL}"]`),
    ).toHaveLength(1);

    setLoadedSezzle();
    getSezzleScript()?.dispatchEvent(new Event("load"));
    await Promise.all([firstReplacePromise, secondReplacePromise]);

    expect(firstApi.sezzle).not.toBeNull();
    expect(secondApi.sezzle).not.toBeNull();
  });

  it("waits for Sezzle readiness before replacing stored JSON and exposes the SDK instance", async () => {
    setBrowserRuntime();

    const api = await createTestApi(createApiJson([cardOption]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([sezzleOption, cardOption]),
    );

    expect(api.json!.payment_options).toEqual([cardOption]);
    expect(api.sezzle).toBeNull();

    const { Checkout, getLastInstance } = setLoadedSezzle();

    getSezzleScript()?.dispatchEvent(new Event("load"));
    await replacePromise;

    expect(Checkout).toHaveBeenCalledWith({
      publicKey: sezzleOption.public_key,
    });
    expect(api.json!.payment_options).toEqual([sezzleOption, cardOption]);
    expect(api.sezzle).toBe(getLastInstance());
  });

  it("removes Sezzle payment options when the Sezzle SDK script fails to load", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = await createTestApi(createApiJson([cardOption]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([sezzleOption, cardOption]),
    );

    getSezzleScript()?.dispatchEvent(new Event("error"));
    await replacePromise;

    expect(api.json!.payment_options).toEqual([cardOption]);
    expect(api.sezzle).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Sezzle payment options were removed because the Sezzle SDK could not be loaded.",
    );
  });

  it("removes Sezzle payment options when the Sezzle constructor throws", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = await createTestApi(createApiJson([cardOption]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([sezzleOption, cardOption]),
    );

    setLoadedSezzle(() => {
      throw new Error("Sezzle constructor failed.");
    });
    getSezzleScript()?.dispatchEvent(new Event("load"));
    await replacePromise;

    expect(api.json!.payment_options).toEqual([cardOption]);
    expect(api.sezzle).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Sezzle payment options were removed because the Sezzle SDK could not be loaded.",
    );
  });
});
