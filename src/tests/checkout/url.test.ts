import { toFormData, toQueryString } from "../../checkout/utils/url";

// Every request body and query string the checkout API sends goes through these
// two helpers, so the contract that matters is which values are dropped, which
// are JSON-encoded, and which falsy values survive.

describe("Checkout URL helpers", () => {
  it("builds form data, dropping null and undefined but keeping other falsy values", () => {
    const form = toFormData({
      absent: undefined,
      count: 0,
      empty: "",
      enabled: false,
      missing: null,
      name: "value",
    });

    expect([...form.keys()].sort()).toEqual([
      "count",
      "empty",
      "enabled",
      "name",
    ]);
    expect(form.get("count")).toBe("0");
    expect(form.get("empty")).toBe("");
    expect(form.get("enabled")).toBe("false");
    expect(form.get("name")).toBe("value");
  });

  it("JSON-encodes object and array form values", () => {
    const form = toFormData({
      items: [{ code: "abc" }],
      shipment: { city: "Austin" },
    });

    expect(form.get("items")).toBe('[{"code":"abc"}]');
    expect(form.get("shipment")).toBe('{"city":"Austin"}');
  });

  it("builds a percent-encoded query string, dropping null and undefined", () => {
    expect(
      toQueryString({
        absent: undefined,
        missing: null,
        page: 2,
        sort: "date desc",
      })
    ).toBe("page=2&sort=date+desc");
  });

  it("stringifies non-primitive query values instead of JSON-encoding them", () => {
    // toQueryString's signature excludes objects; if one slips past the types
    // it becomes "[object Object]" rather than JSON, unlike toFormData.
    const query = toQueryString({
      filter: { code: "abc" } as unknown as string,
    });

    expect(query).toBe("filter=%5Bobject+Object%5D");
  });
});
