import { afterEach, describe, expect, it, vi } from "vitest";
import type { APIJson } from "../../checkout/types";

import { API, MIN_POSTAL_CODE_LOOKUP_LENGTH } from "../../checkout";

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
    saved_payment_methods: [],
    payment_gateways: [],
    language_strings: {},
  };
}

function createApi(): API {
  const api = new API({ initialJson: createApiJson() });
  api.setStoreDomain("store.test");
  return api;
}

function mockJsonResponse(body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getAddressSuggestions input floor", () => {
  it("exposes a floor of 3", () => {
    expect(MIN_POSTAL_CODE_LOOKUP_LENGTH).toBe(3);
  });

  it("returns [] without fetching below the floor", async () => {
    const fetchSpy = mockJsonResponse([]);

    await expect(
      createApi().getAddressSuggestions({ postalCode: "90", country: "US" }),
    ).resolves.toEqual([]);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("measures the floor after trimming", async () => {
    const fetchSpy = mockJsonResponse([]);

    await expect(
      createApi().getAddressSuggestions({ postalCode: "  90  ", country: "US" }),
    ).resolves.toEqual([]);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches at exactly the floor", async () => {
    const fetchSpy = mockJsonResponse([]);

    await createApi().getAddressSuggestions({ postalCode: "902", country: "US" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://store.test/helpers?action=get_address_suggestions&country=US&postal_code=902",
    );
  });
});

describe("getAddressSuggestions response parsing", () => {
  it("returns city and region entries as sent", async () => {
    mockJsonResponse([{ city: "Beverly Hills", region: "CA" }]);

    await expect(
      createApi().getAddressSuggestions({ postalCode: "90210", country: "US" }),
    ).resolves.toEqual([{ city: "Beverly Hills", region: "CA" }]);
  });

  it("passes through an empty region", async () => {
    mockJsonResponse([{ city: "Vaduz", region: "" }]);

    await expect(
      createApi().getAddressSuggestions({ postalCode: "9490", country: "LI" }),
    ).resolves.toEqual([{ city: "Vaduz", region: "" }]);
  });

  it("treats an empty array as a normal no-match answer", async () => {
    mockJsonResponse([]);

    await expect(
      createApi().getAddressSuggestions({ postalCode: "00000", country: "US" }),
    ).resolves.toEqual([]);
  });

  it("returns [] when the body is not an array", async () => {
    mockJsonResponse({ ok: false, details: "nope" });

    await expect(
      createApi().getAddressSuggestions({ postalCode: "90210", country: "US" }),
    ).resolves.toEqual([]);
  });
});
