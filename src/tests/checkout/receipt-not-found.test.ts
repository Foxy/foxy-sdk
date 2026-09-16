import type { APIJson } from "../../checkout/types";

import { API } from "../../checkout/API";

/**
 * What the receipt page hydrates the client with when it cannot find the
 * receipt. It still hydrates so the shopper sees the error, so `store`,
 * `messages` and `template_set` are there and everything the backend builds
 * from a transaction is null or empty.
 *
 * `format` and `display` are filled in here, but the backend nulls them on this
 * payload today. They are store and template-set config with no transaction
 * behind them, so FX-411 asks for them to be sent; APIJson declares them
 * non-null on the assumption it lands. Until then the SDK throws on a real
 * not-found receipt before it reaches any of the cases below.
 */
function createReceiptNotFoundJson(): APIJson {
  return {
    template_set: { code: "default", id: 1 },
    transaction: null,
    session: null,
    debug: false,
    customer: null,
    shipments: [],
    items: [],
    totals: [],
    billing_address: null,
    store: {
      id: 1,
      name: "Test Store",
      domain: "example.com",
      logo_url: null,
      website_url: null,
      checkout_url: "https://example.com/checkout",
      cancel_and_continue_url: null,
      has_location_dependent_taxes: false,
      has_eligible_gift_cards: false,
      has_eligible_coupons: false,
      supported_payment_cards: [],
    },
    messages: [
      {
        context: null,
        message: "The receipt you requested could not be found.",
        level: "error",
      },
    ],
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
    saved_payment_methods: [],
    payment_gateways: [],
    language_strings: {},
    next_action: null,
  };
}

describe("a receipt the backend could not find", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hydrates without throwing and keeps the error message", async () => {
    const api = new API({ storeDomain: "store.test" });

    await api.hydrateJson(createReceiptNotFoundJson(), { state: "idle" });

    expect(api.json?.messages[0]?.message).toBe(
      "The receipt you requested could not be found.",
    );
    expect(api.json?.session).toBeNull();
    expect(api.json?.customer).toBeNull();
  });

  it("hydrates without throwing when the store domain is null too", async () => {
    const json = createReceiptNotFoundJson();
    json.store = { ...json.store, domain: null };

    const api = new API({ storeDomain: "store.test" });

    await api.hydrateJson(json, { state: "idle" });

    expect(api.json?.store.domain).toBeNull();
  });

  it("omits session_id from a request instead of throwing on it", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(createReceiptNotFoundJson()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = new API({ storeDomain: "store.test" });
    await api.hydrateJson(createReceiptNotFoundJson(), { state: "idle" });

    api.signOut();

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    expect(fetchSpy).toHaveBeenCalled();

    const body = fetchSpy.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.has("session_id")).toBe(false);
  });

  it("refuses a billing address update instead of throwing on the null address", async () => {
    const api = new API({ storeDomain: "store.test" });
    await api.hydrateJson(createReceiptNotFoundJson(), { state: "idle" });

    api.updateBillingAddress({ first_name: "Alice" });

    const contexts = (api.json?.messages ?? []).map((m) => m.context);
    expect(contexts).toContain("billing-address-update");
  });
});
