import type { APIJson } from "../../checkout/types";

import { API } from "../../checkout/API";

function createApiJson(): APIJson {
  return {
    template_set: { code: "default", id: 1 },
    session: { name: "fcsid", id: "session-id" },
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
    saved_payment_methods: [],
    payment_gateways: [],
    language_strings: {},
  };
}

describe("checkOut", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("includes new_customer_password in the submit payload when provided", async () => {
    const json = createApiJson();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.checkOut(
      { gateway: "purchase_order", purchase_order_number: "PO-123" },
      { newAccountPassword: "correct horse battery staple" },
    );

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://store.test/checkout");

    const body = init?.body as URLSearchParams;
    expect(body.get("new_customer_password")).toBe("correct horse battery staple");
    expect(body.get("gateway")).toBe("purchase_order");
    expect(body.get("action")).toBe("submit");
  });

  it("omits new_customer_password from the submit payload when not provided", async () => {
    const json = createApiJson();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.checkOut({ gateway: "purchase_order", purchase_order_number: "PO-123" });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    const body = fetchSpy.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.has("new_customer_password")).toBe(false);
  });
});
