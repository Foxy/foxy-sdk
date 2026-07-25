export type CountryOption = { value: string; label: string };

// Intl.DisplayNames construction is not free and callers rebuild their option
// lists on every state change, so cache one instance per locale.
const displayNamesByLocale = new Map<string, Intl.DisplayNames>();

function getDisplayNames(locale: string): Intl.DisplayNames {
  const cached = displayNamesByLocale.get(locale);
  if (cached) return cached;

  // `fallback: "code"` returns the code itself for unknown regions rather
  // than throwing.
  const displayNames = new Intl.DisplayNames([locale], {
    type: "region",
    fallback: "code",
  });
  displayNamesByLocale.set(locale, displayNames);
  return displayNames;
}

/**
 * Maps ISO 3166-1 alpha-2 country codes — the shape of
 * `Shipment.country_options` and `BillingAddress.country_options` — to
 * `{ value, label }` options whose names are localized for `locale` and
 * sorted by that locale's collation.
 *
 * Codes are uppercased first: `Intl.DisplayNames#of` throws a RangeError on
 * lowercase input.
 *
 * Returns an empty array for anything that is not an array of usable codes,
 * so callers can branch on `.length` to keep a plain-text fallback.
 */
export function toCountryOptions(codes: unknown, locale: string): CountryOption[] {
  if (!Array.isArray(codes)) return [];

  const displayNames = getDisplayNames(locale);
  const collator = new Intl.Collator(locale);

  return codes
    .filter(
      (code): code is string => typeof code === "string" && code.trim() !== "",
    )
    .map((code) => {
      const value = code.trim().toUpperCase();
      return { value, label: displayNames.of(value) ?? value };
    })
    .sort((a, b) => collator.compare(a.label, b.label));
}
