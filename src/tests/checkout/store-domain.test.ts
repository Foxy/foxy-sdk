import type { APIJson } from "../../checkout/types";

import { API } from "../../checkout/API";

function flushTasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
}

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
    saved_payment_methods: [],
    payment_gateways: [],
    language_strings: {},
  };
}

describe("store domain activation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays inactive without storeDomain until a store domain is set", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(() => new API({ initialJson: createApiJson() })).not.toThrow();

    const api = new API({ initialJson: createApiJson() });

    await expect(
      api.getAddressSuggestions({ postalCode: "12345", country: "US" }),
    ).rejects.toThrow(
      "This API instance is inactive until storeDomain is set.",
    );

    api.setStoreDomain("store.test");

    await expect(
      api.getAddressSuggestions({ postalCode: "12345", country: "US" }),
    ).resolves.toEqual([]);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://store.test/helpers?action=get_address_suggestions&country=US&postal_code=12345",
    );
  });

  it("loads cart JSON when storeDomain is set after inactive initialization", async () => {
    const json = createApiJson();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = new API({});

    expect(api.state).toBe("idle");
    expect(api.json).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();

    api.setStoreDomain("store.test");
    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://store.test/cart?output=json",
    );
    expect(api.json).toEqual(json);
  });
});
