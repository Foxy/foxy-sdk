/**
 * @vitest-environment jsdom
 */

import type { APIJson, NextAction } from "../../checkout/types";

import { API } from "../../checkout/API";

function createApiJson(): APIJson {
  return {
    transaction: null,
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

function jsonWithNextAction(nextAction: NextAction | null): APIJson {
  return { ...createApiJson(), next_action: nextAction };
}

function mockFetchJson(json: APIJson): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("next action handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dispatches next-action-required when checkOut resolves with a requires_action next_action", async () => {
    const nextAction: NextAction = {
      type: "confirm_intent",
      resume_token: "resume-token",
      gateway: "stripe_v2",
      params: { client_secret: "pi_123_secret_abc" },
    };
    mockFetchJson(jsonWithNextAction(nextAction));

    const api = new API({
      initialJson: createApiJson(),
      storeDomain: "store.test",
    });
    const listener = vi.fn();
    api.addEventListener("next-action-required", listener);

    api.checkOut({ gateway: "stripe_v2", payment_intent_id: "pi_123" });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual(nextAction);
  });

  it("does not dispatch next-action-required when there is no next_action", async () => {
    mockFetchJson(jsonWithNextAction(null));

    const api = new API({
      initialJson: createApiJson(),
      storeDomain: "store.test",
    });
    const listener = vi.fn();
    api.addEventListener("next-action-required", listener);

    api.checkOut({
      gateway: "purchase_order",
      purchase_order_number: "PO-123",
    });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    expect(listener).not.toHaveBeenCalled();
  });

  it("navigates via window.location.assign for GET redirect next actions", async () => {
    const nextAction: NextAction = {
      type: "redirect",
      url: "https://gateway.tld/pay",
      method: "GET",
    };
    mockFetchJson(jsonWithNextAction(nextAction));

    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      value: { assign },
      writable: true,
      configurable: true,
    });

    const api = new API({
      initialJson: createApiJson(),
      storeDomain: "store.test",
    });
    api.checkOut({
      gateway: "purchase_order",
      purchase_order_number: "PO-123",
    });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    expect(assign).toHaveBeenCalledWith("https://gateway.tld/pay");
  });

  it("auto-submits a hidden POST form for POST redirect next actions", async () => {
    const nextAction: NextAction = {
      type: "redirect",
      url: "https://gateway.tld/pay",
      method: "POST",
      body: { order_id: "abc123", md: "xyz" },
    };
    mockFetchJson(jsonWithNextAction(nextAction));

    const submitSpy = vi
      .spyOn(HTMLFormElement.prototype, "submit")
      .mockImplementation(() => undefined);

    const api = new API({
      initialJson: createApiJson(),
      storeDomain: "store.test",
    });
    api.checkOut({
      gateway: "purchase_order",
      purchase_order_number: "PO-123",
    });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    expect(submitSpy).toHaveBeenCalledTimes(1);
    const form = submitSpy.mock.instances[0] as HTMLFormElement;
    expect(form.action).toBe("https://gateway.tld/pay");
    expect(form.method).toBe("post");
    expect(
      form.querySelector('input[name="order_id"]')?.getAttribute("value"),
    ).toBe("abc123");
    expect(form.querySelector('input[name="md"]')?.getAttribute("value")).toBe(
      "xyz",
    );
  });

  it("skips the default redirect when next-action-redirect is canceled", async () => {
    const nextAction: NextAction = {
      type: "redirect",
      url: "https://gateway.tld/pay",
      method: "GET",
    };
    mockFetchJson(jsonWithNextAction(nextAction));

    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      value: { assign },
      writable: true,
      configurable: true,
    });

    const api = new API({
      initialJson: createApiJson(),
      storeDomain: "store.test",
    });
    api.addEventListener("next-action-redirect", (event) => {
      event.preventDefault();
    });

    api.checkOut({
      gateway: "purchase_order",
      purchase_order_number: "PO-123",
    });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    expect(assign).not.toHaveBeenCalled();
  });

  it("posts action=continue with resume_token and sdk_result", async () => {
    const json = createApiJson();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = new API({ initialJson: json, storeDomain: "store.test" });

    api.continueCheckOut({
      resumeToken: "resume-token-abc",
      sdkResult: { status: "succeeded" },
    });

    await vi.waitFor(() => {
      expect(api.state).toBe("idle");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://store.test/checkout");

    const body = init?.body as URLSearchParams;
    expect(body.get("action")).toBe("continue");
    expect(body.get("resume_token")).toBe("resume-token-abc");
    expect(body.get("sdk_result")).toBe(
      JSON.stringify({ status: "succeeded" }),
    );
  });
});
