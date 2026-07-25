import { describe, expect, it } from "vitest";

import { toCountryOptions } from "../../checkout/countryOptions";

describe("toCountryOptions", () => {
  it("resolves ISO codes to localized display names", () => {
    expect(toCountryOptions(["DE"], "en-US")).toEqual([{ value: "DE", label: "Germany" }]);
  });

  it("localizes names to the given locale", () => {
    expect(toCountryOptions(["DE"], "de-DE")[0].label).toBe("Deutschland");
  });

  it("sorts by localized name, not by code", () => {
    expect(toCountryOptions(["US", "CA", "DE"], "en-US").map((o) => o.label)).toEqual([
      "Canada",
      "Germany",
      "United States",
    ]);
  });

  it("sorts using the given locale's collation", () => {
    // In Swedish, Ä sorts after Z — so Austria (Österrike) comes last, while
    // a naive code-point sort would put it before Tyskland.
    expect(toCountryOptions(["AT", "DE"], "sv-SE").map((o) => o.value)).toEqual(["DE", "AT"]);
  });

  it("uppercases lowercase codes instead of throwing", () => {
    expect(toCountryOptions(["de"], "en-US")).toEqual([{ value: "DE", label: "Germany" }]);
  });

  it("falls back to the raw code for unknown values", () => {
    // "ZZ" is CLDR's reserved "Unknown Region" pseudo-code and resolves to a
    // real display name, so it doesn't exercise the fallback path. "XX" has
    // no CLDR entry and genuinely falls back to the code itself.
    expect(toCountryOptions(["XX"], "en-US")).toEqual([{ value: "XX", label: "XX" }]);
  });

  it("drops empty and non-string entries", () => {
    expect(toCountryOptions(["", 7, null, "DE"], "en-US")).toEqual([
      { value: "DE", label: "Germany" },
    ]);
  });

  it("returns an empty array for a non-array input", () => {
    expect(toCountryOptions(undefined, "en-US")).toEqual([]);
    expect(toCountryOptions("DE", "en-US")).toEqual([]);
  });

  it("returns an empty array for an empty input", () => {
    expect(toCountryOptions([], "en-US")).toEqual([]);
  });
});
