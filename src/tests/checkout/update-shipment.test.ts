import type { APIJson, Shipment } from "../../checkout/types";

import { API } from "../../checkout/API";

function createShipment(addressName: string | null): Shipment {
  return {
    address_id: null,
    address_name: addressName,
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
    shipping_service_id: null,
    has_shippable_items: true,
    has_live_rate_shippable_items: false,
  };
}

function createApiJson(shipments: Shipment[]): APIJson {
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
    shipments,
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

function mockFetch(json: APIJson) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("updateShipment", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the shipping_ prefix on a single-shipment transaction", async () => {
    const json = createApiJson([createShipment("")]);
    const fetchSpy = mockFetch(json);
    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.updateShipment({ first_name: "Alice", shipping_service_id: 12 });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    const body = fetchSpy.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("shipping_first_name")).toBe("Alice");
    expect(body.has("shipto_0_first_name")).toBe(false);
    expect(body.get("shipping_service_id")).toBe("12");
  });

  it("uses the shipto_<index>_ prefix on a multiship transaction", async () => {
    const json = createApiJson([
      createShipment("Home"),
      createShipment("Work"),
    ]);
    const fetchSpy = mockFetch(json);
    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.updateShipment({ index: 0, first_name: "Alice" });
    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    api.updateShipment({ index: 1, first_name: "Wanda" });
    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    const firstBody = fetchSpy.mock.calls[0][1]?.body as URLSearchParams;
    expect(firstBody.get("shipto_0_first_name")).toBe("Alice");
    expect(firstBody.has("shipping_first_name")).toBe(false);

    const secondBody = fetchSpy.mock.calls[1][1]?.body as URLSearchParams;
    expect(secondBody.get("shipto_1_first_name")).toBe("Wanda");
    expect(secondBody.has("shipping_first_name")).toBe(false);
  });

  // A non-multiship transaction reports its one shipment with a null address
  // name — the checkout JSON turns the empty name into null on the wire.
  it("uses the shipping_ prefix when a single shipment has a null address name", async () => {
    const json = createApiJson([createShipment(null)]);
    const fetchSpy = mockFetch(json);
    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.updateShipment({ first_name: "Alice", shipping_service_id: 12 });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    const body = fetchSpy.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("shipping_first_name")).toBe("Alice");
    expect(body.has("shipto_0_first_name")).toBe(false);
    expect(body.get("shipping_service_id")).toBe("12");
  });

  // A cart whose items all carry the same non-default `shipto` is multiship on
  // the backend even though it has one shipment, so the count alone cannot
  // decide the prefix. The named address is what tells the two apart.
  it("uses the shipto_0_ prefix when a single shipment carries an address name", async () => {
    const json = createApiJson([createShipment("Home")]);
    const fetchSpy = mockFetch(json);
    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.updateShipment({ first_name: "Alice", shipping_service_id: 12 });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    const body = fetchSpy.mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("shipto_0_first_name")).toBe("Alice");
    expect(body.has("shipping_first_name")).toBe(false);
    expect(body.get("shipto_0_shipping_service_id")).toBe("12");
  });
});
