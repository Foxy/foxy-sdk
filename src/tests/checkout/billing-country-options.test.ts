import type { APIJson } from "../../checkout/types";

import { afterEach, describe, expect, it, vi } from "vitest";
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
    shipments: [
      {
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
        shipping_service_id: null,
        has_shippable_items: true,
        has_live_rate_shippable_items: false,
        country_options: ["US", "CA"],
      },
    ],
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
      use_separate_billing_address: true,
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
      country: "GB",
      country_options: ["GB", "FR"],
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
      locale_code: "en_US",
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
      registration: "disabled",
    },
    custom_config: {},
    saved_payment_methods: [],
    payment_gateways: [],
    language_strings: {},
  } as unknown as APIJson;
}

// The brief's original construction — `new API({ storeDomain: "example.com" }
// as never)` followed by assigning `.json` via a cast — doesn't work here:
// `API#json` is a getter with no setter, so that assignment throws at
// runtime. `update-billing-address.test.ts` establishes the working pattern
// instead: pass the fixture as `initialJson` to the constructor, and mock
// `fetch` so requests that pass validation (and proceed to the network) don't
// hit a real endpoint.
function createApi(json: APIJson): API {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  return new API({ initialJson: json, storeDomain: "store.test" });
}

describe("billing country options isolation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects a country that only the shipping list allows", () => {
    const api = createApi(createApiJson());

    api.updateBillingAddress({ country: "CA" });

    const messages = api.json?.messages ?? [];
    expect(
      messages.some((message) => message.context === "billing-address-update"),
    ).toBe(true);
  });

  it("accepts a country the billing list allows", () => {
    const api = createApi(createApiJson());

    api.updateBillingAddress({ country: "FR" });

    const messages = api.json?.messages ?? [];
    expect(
      messages.some((message) => message.context === "billing-address-update"),
    ).toBe(false);
  });

  // The two tests above hold under both the buggy and fixed code, because
  // `billing_address.country_options` is present in both fixtures — the `??`
  // fallback never triggers. The bug is only observable when the billing
  // list is absent: the fallback then silently applies the shipment's list
  // to billing, which is exactly what this task's second commit removes.
  it("does not fall back to the shipping list when billing has no country_options", () => {
    const json = createApiJson();
    delete (json.billing_address as { country_options?: string[] }).country_options;

    const api = createApi(json);

    api.updateBillingAddress({ country: "GB" });

    const messages = api.json?.messages ?? [];
    expect(
      messages.some((message) => message.context === "billing-address-update"),
    ).toBe(false);
  });
});

// Consumers (foxy-elements, foxy-checkout) normalize the value they submit to
// `.trim().toUpperCase()`, and `toCountryOptions` uppercases every option
// value it produces for display — but neither of those touches the *raw*
// `country_options`/`region_options` arrays the server actually sends, which
// `validateProvidedAddressFields` compares against. A store emitting
// lowercase (or mixed-case) options must not have every edit rejected
// client-side before it reaches the network. This exercises the fix through
// `API#updateBillingAddress`, the real consumer entry point — a unit test of
// the validator alone wouldn't catch a regression here, since nothing else
// in this file drives it.
describe("case-insensitive allowlist comparison", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates an uppercase submitted country against a lowercase country_options list", () => {
    const json = createApiJson();
    (json.billing_address as { country_options?: string[] }).country_options = ["gb", "fr"];
    const api = createApi(json);

    api.updateBillingAddress({ country: "GB" });

    const messages = api.json?.messages ?? [];
    expect(
      messages.some((message) => message.context === "billing-address-update"),
    ).toBe(false);
  });

  it("validates a lowercase submitted country against an uppercase country_options list", () => {
    // createApiJson()'s billing_address.country_options is ["GB", "FR"].
    const json = createApiJson();
    const api = createApi(json);

    api.updateBillingAddress({ country: "gb" });

    const messages = api.json?.messages ?? [];
    expect(
      messages.some((message) => message.context === "billing-address-update"),
    ).toBe(false);
  });

  it("validates an uppercase submitted region against a lowercase region_options list", () => {
    const json = createApiJson();
    (json.billing_address as { region_options?: string[] }).region_options = ["ca", "ny"];
    const api = createApi(json);

    api.updateBillingAddress({ region: "CA" });

    const messages = api.json?.messages ?? [];
    expect(
      messages.some((message) => message.context === "billing-address-update"),
    ).toBe(false);
  });

  it("still rejects a region absent from the list regardless of case", () => {
    const json = createApiJson();
    (json.billing_address as { region_options?: string[] }).region_options = ["ca", "ny"];
    const api = createApi(json);

    api.updateBillingAddress({ region: "TX" });

    const messages = api.json?.messages ?? [];
    expect(
      messages.some((message) => message.context === "billing-address-update"),
    ).toBe(true);
  });
});
