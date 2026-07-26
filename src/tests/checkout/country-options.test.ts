import { describe, expect, it, vi } from "vitest";

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

  it("uppercases lowercase codes (lowercase would otherwise silently fall back to the raw code, not throw)", () => {
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

  // FINDING 1: malformed string codes must be dropped like null/"", not
  // reach Intl.DisplayNames#of and throw. `country_options` is untyped
  // server JSON, so any of these shapes is reachable at runtime.
  it("drops malformed string codes instead of throwing (finding 1)", () => {
    expect(toCountryOptions(["USA", "DE"], "en-US")).toEqual([
      { value: "DE", label: "Germany" },
    ]);
    expect(toCountryOptions(["!!", "DE"], "en-US")).toEqual([
      { value: "DE", label: "Germany" },
    ]);
  });

  it("returns an empty array when every code is malformed (finding 1)", () => {
    expect(toCountryOptions(["1"], "en-US")).toEqual([]);
  });

  // FINDING 2: `format.locale_code` arrives POSIX-form (underscore) from the
  // API, and must be normalized rather than thrown on. `de_DE` is used
  // (rather than `en_US`) so the assertion can only pass if the underscore
  // was actually converted and the resulting locale used for real -- a stub
  // that silently defaults to "en-US" would produce "Germany", not
  // "Deutschland", and fail this assertion.
  it("normalizes a POSIX-form (underscore) locale instead of throwing (finding 2)", () => {
    expect(toCountryOptions(["DE"], "de_DE")[0].label).toBe("Deutschland");
  });

  it("falls back to a default locale instead of throwing on an unusable locale (finding 2)", () => {
    expect(toCountryOptions(["DE"], "")).toEqual([{ value: "DE", label: "Germany" }]);
    expect(toCountryOptions(["DE"], "!!!")).toEqual([{ value: "DE", label: "Germany" }]);
  });

  // FINDING 3: Intl.Collator construction is expensive and must be cached
  // per locale, same as Intl.DisplayNames already is. Uses a locale no other
  // test in this file touches, since the cache is module-level and persists
  // across tests -- a previously-warmed locale would make the spy see 0
  // calls instead of 1 on the second invocation.
  it("caches the Intl.Collator instance per locale instead of rebuilding it every call (finding 3)", () => {
    const spy = vi.spyOn(Intl, "Collator");
    try {
      toCountryOptions(["DE"], "nl-NL");
      toCountryOptions(["DE"], "nl-NL");
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  // ALSO-FIX 1: `normalizeLocale` must cache by the *canonicalized* locale,
  // not by the raw (merely hyphenated) input string — otherwise "en-US",
  // "en_US", "en-us", and "EN_US" each build and cache their own
  // Intl.DisplayNames/Intl.Collator pair instead of sharing one. Uses
  // "pt-BR" and its spelling variants because no other test in this
  // module-level-cached file has warmed that locale.
  it("shares one cache entry across spelling variants of the same canonical locale (also-fix 1)", () => {
    const spy = vi.spyOn(Intl, "Collator");
    try {
      toCountryOptions(["DE"], "pt-BR");
      toCountryOptions(["DE"], "pt_BR");
      toCountryOptions(["DE"], "pt-br");
      toCountryOptions(["DE"], "PT_BR");
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  // ALSO-FIX 2/3: `normalizeLocale`'s `typeof locale === "string"` guard is
  // load-bearing — `locale` is typed `unknown` internally — but was
  // previously untested. A non-string `locale` (e.g. from untyped upstream
  // data) must fall back to the default locale instead of throwing.
  it("falls back to the default locale instead of throwing for a non-string locale (also-fix 2/3)", () => {
    expect(toCountryOptions(["DE"], null as unknown as string)).toEqual([
      { value: "DE", label: "Germany" },
    ]);
  });
});
