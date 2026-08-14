/**
 * @vitest-environment jsdom
 */

import type { APIJson, KlarnaSdkInstance } from "../../checkout/types";

const KLARNA_JS_API_URL = "https://x.klarnacdn.net/kp/lib/v1/api.js";

type KlarnaWindow = Window & {
  Klarna?: KlarnaSdkInstance;
  klarnaAsyncCallback?: () => void;
};

const authorizeGatewayConfig = { type: "authorize" } as const;
const klarnaGatewayConfig = {
  type: "klarna",
  session_id: "068df369-13a7-4d47-a564-62f8408bb760",
  client_token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwMDAtMDAwMDAtMDAwMC0wMDAwMDAwMC0wMDAwIiwidXJsIjoiaHR0cHM6Ly9jcmVkaXQtZXUua2xhcm5hLmNvbSJ9.A_rHWMSXQN2NRNGYTREBTkGwYwtm-sulkSDMvlJL87M",
  payment_method_categories: [
    {
      identifier: "klarna",
      name: "Pay with Klarna",
      asset_urls: {
        descriptive:
          "https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.svg",
        standard:
          "https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.svg",
      },
    },
  ],
} as const;
const klarnaOption = {
  gateway: "klarna",
  ...klarnaGatewayConfig,
};

const hadWindow = "window" in globalThis;
const hadDocument = "document" in globalThis;
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalKlarna = (originalWindow as KlarnaWindow).Klarna;
const originalKlarnaAsyncCallback = (originalWindow as KlarnaWindow)
  .klarnaAsyncCallback;

function getKlarnaScript(): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(`script[src="${KLARNA_JS_API_URL}"]`);
}

function flushTasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
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

  Reflect.deleteProperty(originalWindow as KlarnaWindow, "Klarna");
  Reflect.deleteProperty(originalWindow as KlarnaWindow, "klarnaAsyncCallback");
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

  if (originalKlarna) {
    (originalWindow as KlarnaWindow).Klarna = originalKlarna;
  } else {
    Reflect.deleteProperty(originalWindow as KlarnaWindow, "Klarna");
  }

  if (originalKlarnaAsyncCallback) {
    (originalWindow as KlarnaWindow).klarnaAsyncCallback =
      originalKlarnaAsyncCallback;
  } else {
    Reflect.deleteProperty(
      originalWindow as KlarnaWindow,
      "klarnaAsyncCallback",
    );
  }
}

function setLoadedKlarna(init = vi.fn()): {
  init: ReturnType<typeof vi.fn>;
  klarna: KlarnaSdkInstance;
} {
  const klarna = {
    Payments: {
      init,
      load: vi.fn(),
      loadPaymentReview: vi.fn(),
      authorize: vi.fn(),
      reauthorize: vi.fn(),
      finalize: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
  } satisfies KlarnaSdkInstance;

  (window as KlarnaWindow).Klarna = klarna;

  return { init, klarna };
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

describe("Klarna payment option loading", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    getKlarnaScript()?.remove();
    restoreRuntime();
  });

  it("loads the Klarna SDK script when Klarna appears in payment options", async () => {
    setBrowserRuntime();

    await createTestApi(
      createApiJson([klarnaGatewayConfig, authorizeGatewayConfig]),
    );

    const script = getKlarnaScript();

    expect(script).not.toBeNull();
    expect(script?.src).toBe(KLARNA_JS_API_URL);
  });

  it("does not load the Klarna SDK script when Klarna is absent", async () => {
    setBrowserRuntime();

    await createTestApi(createApiJson([authorizeGatewayConfig]));

    expect(getKlarnaScript()).toBeNull();
  });

  it("does not duplicate the Klarna SDK script across API instances", async () => {
    setBrowserRuntime();

    const firstApi = await createTestApi(
      createApiJson([authorizeGatewayConfig]),
    );
    const secondApi = await createTestApi(
      createApiJson([authorizeGatewayConfig]),
    );
    const firstReplacePromise = firstApi.replaceJsonForTesting(
      createApiJson([klarnaGatewayConfig, authorizeGatewayConfig]),
    );
    const secondReplacePromise = secondApi.replaceJsonForTesting(
      createApiJson([klarnaGatewayConfig, authorizeGatewayConfig]),
    );

    expect(
      document.querySelectorAll(`script[src="${KLARNA_JS_API_URL}"]`),
    ).toHaveLength(1);

    const { klarna } = setLoadedKlarna();

    (window as KlarnaWindow).klarnaAsyncCallback?.();
    await Promise.all([firstReplacePromise, secondReplacePromise]);

    expect(firstApi.klarna).toBe(klarna);
    expect(secondApi.klarna).toBe(klarna);
  });

  it("publishes raw JSON before Klarna readiness and exposes the SDK instance when ready", async () => {
    setBrowserRuntime();

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([klarnaGatewayConfig, authorizeGatewayConfig]),
    );
    let didReplaceResolve = false;

    void replacePromise.then(() => {
      didReplaceResolve = true;
    });

    expect(api.json!.payment_gateways).toEqual([
      klarnaGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.klarna).toBeNull();
    expect(didReplaceResolve).toBe(false);

    getKlarnaScript()?.dispatchEvent(new Event("load"));
    await flushTasks();

    expect(api.json!.payment_gateways).toEqual([
      klarnaGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.klarna).toBeNull();

    const { init, klarna } = setLoadedKlarna();

    (window as KlarnaWindow).klarnaAsyncCallback?.();
    await replacePromise;

    expect(init).toHaveBeenCalledWith({
      client_token: klarnaOption.client_token,
    });
    expect(api.json!.payment_gateways).toEqual([
      klarnaGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.klarna).toBe(klarna);
  });

  it("keeps the raw Klarna gateway when the Klarna SDK script fails to load", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([klarnaGatewayConfig, authorizeGatewayConfig]),
    );

    getKlarnaScript()?.dispatchEvent(new Event("error"));
    await replacePromise;

    expect(api.json!.payment_gateways).toEqual([
      klarnaGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.klarna).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Klarna SDK was not initialized because the Klarna SDK could not be loaded.",
    );
  });

  it("keeps the raw Klarna gateway when Klarna initialization fails", async () => {
    setBrowserRuntime();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const replacePromise = api.replaceJsonForTesting(
      createApiJson([klarnaGatewayConfig, authorizeGatewayConfig]),
    );

    setLoadedKlarna(
      vi.fn(() => {
        throw new Error("Klarna init failed.");
      }),
    );

    (window as KlarnaWindow).klarnaAsyncCallback?.();
    await replacePromise;

    expect(api.json!.payment_gateways).toEqual([
      klarnaGatewayConfig,
      authorizeGatewayConfig,
    ]);
    expect(api.klarna).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "Klarna SDK was not initialized because the Klarna SDK could not be loaded.",
    );
  });
});

describe("hydrateJson with a Klarna gateway", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    getKlarnaScript()?.remove();
    restoreRuntime();
  });

  async function createHydratedApi() {
    setBrowserRuntime();

    const api = await createTestApi(createApiJson([authorizeGatewayConfig]));
    const hydratePromise = api.hydrateJson(
      createApiJson([klarnaGatewayConfig, authorizeGatewayConfig]),
    );

    getKlarnaScript()?.dispatchEvent(new Event("load"));
    await flushTasks();
    setLoadedKlarna();
    (window as KlarnaWindow).klarnaAsyncCallback?.();
    await hydratePromise;

    return api;
  }

  // Consumers re-hydrate on every render (see foxy-checkout's Payment element).
  // An update event feeds back into that render, so a hydrate that changes
  // nothing must stay silent or the two sides drive each other in a loop.
  it("does not emit an update when re-hydrating identical JSON", async () => {
    const api = await createHydratedApi();
    expect(api.klarna).not.toBeNull();

    let updates = 0;
    api.addEventListener("update", () => {
      updates++;
    });

    await api.hydrateJson(
      createApiJson([klarnaGatewayConfig, authorizeGatewayConfig]),
    );

    expect(updates).toBe(0);
  });

  // Anything reading `klarna` mid-hydrate must never observe a null gap.
  it("keeps the Klarna SDK instance exposed throughout a re-hydrate", async () => {
    const api = await createHydratedApi();
    const instance = api.klarna;
    expect(instance).not.toBeNull();

    const observed: (typeof instance)[] = [];
    api.addEventListener("update", () => {
      observed.push(api.klarna);
    });

    await api.hydrateJson(
      createApiJson([klarnaGatewayConfig, authorizeGatewayConfig]),
    );

    expect(observed).not.toContain(null);
    expect(api.klarna).toBe(instance);
  });
});
