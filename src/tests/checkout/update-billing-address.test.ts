import type { APIJson } from "../../checkout/types";

import { API } from "../../checkout/API";

function createApiJson(): APIJson {
  return {
    transaction: null,
    next_action: null,
    template_set: { code: "default", id: 1 },
    session: { id: "session-id" },
    debug: false,
    customer: {
      first_name: null,
      last_name: null,
      email: null,
      type: "guest",
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
    use_separate_billing_address: false,
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
    saved_payment_methods: [],
    payment_gateways: [],
    language_strings: {},
  };
}

describe("updateBillingAddress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends use_separate_billing_address as a boolean true", async () => {
    const json = createApiJson();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.updateBillingAddress({ use_separate_billing_address: true });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    const body = fetchSpy.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("use_separate_billing_address")).toBe("true");
    expect(body.has("use_different_addresses")).toBe(false);
  });

  it("sends use_separate_billing_address as a boolean false", async () => {
    const json = createApiJson();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.updateBillingAddress({ use_separate_billing_address: false });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    const body = fetchSpy.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("use_separate_billing_address")).toBe("false");
  });

  it("omits use_separate_billing_address when the flag isn't part of the patch", async () => {
    const json = createApiJson();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.updateBillingAddress({ first_name: "Jane" });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    const body = fetchSpy.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.has("use_separate_billing_address")).toBe(false);
    expect(body.get("billing_first_name")).toBe("Jane");
  });
});
