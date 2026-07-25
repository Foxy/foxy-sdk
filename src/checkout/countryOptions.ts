export type CountryOption = { value: string; label: string };

const DEFAULT_LOCALE = "en-US";

// Well-formed ISO 3166-1 alpha-2 shape. Anything else (three-letter codes,
// punctuation, digits, ...) is dropped rather than passed to
// `Intl.DisplayNames#of`, which throws on malformed region subtags.
const ALPHA2_CODE = /^[A-Za-z]{2}$/;

type LocaleFormatters = {
  displayNames: Intl.DisplayNames;
  collator: Intl.Collator;
};

// Constructing Intl.DisplayNames and (especially) Intl.Collator is not free,
// and callers rebuild their option lists on every state change, so cache one
// pair of instances per normalized locale.
const formattersByLocale = new Map<string, LocaleFormatters>();

/**
 * Converts a possibly POSIX-form (`en_US`) or otherwise unusable locale
 * string into one safe to pass to `Intl.DisplayNames`/`Intl.Collator`,
 * falling back to `DEFAULT_LOCALE` rather than letting a bad value throw.
 */
function normalizeLocale(locale: string): string {
  const trimmed = typeof locale === "string" ? locale.replace(/_/g, "-").trim() : "";
  if (!trimmed) return DEFAULT_LOCALE;

  try {
    // Throws a RangeError for malformed BCP 47 tags without allocating a
    // DisplayNames/Collator instance.
    Intl.getCanonicalLocales(trimmed);
    return trimmed;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function getFormatters(locale: string): LocaleFormatters {
  const cached = formattersByLocale.get(locale);
  if (cached) return cached;

  const formatters: LocaleFormatters = {
    // `fallback: "code"` returns the code itself for unknown regions rather
    // than throwing.
    displayNames: new Intl.DisplayNames([locale], { type: "region", fallback: "code" }),
    collator: new Intl.Collator(locale),
  };
  formattersByLocale.set(locale, formatters);
  return formatters;
}

/**
 * Maps ISO 3166-1 alpha-2 country codes — the shape of
 * `Shipment.country_options` and `BillingAddress.country_options` — to
 * `{ value, label }` options whose names are localized for `locale` and
 * sorted by that locale's collation.
 *
 * Codes are uppercased first: `Intl.DisplayNames#of` matches region codes
 * case-sensitively, so lowercase input doesn't throw but silently falls back
 * to returning the raw code as the label instead of resolving a country
 * name.
 *
 * `locale` is normalized (POSIX underscores converted to hyphens) and, if
 * still unusable, replaced with a default — this is a public SDK export and
 * must not throw over a bad locale string.
 *
 * Returns an empty array for anything that is not an array of usable codes,
 * so callers can branch on `.length` to keep a plain-text fallback.
 */
export function toCountryOptions(codes: unknown, locale: string): CountryOption[] {
  if (!Array.isArray(codes)) return [];

  const normalizedLocale = normalizeLocale(locale);
  const { displayNames, collator } = getFormatters(normalizedLocale);

  return codes
    .filter(
      (code): code is string => typeof code === "string" && ALPHA2_CODE.test(code.trim()),
    )
    .map((code) => {
      const value = code.trim().toUpperCase();
      return { value, label: displayNames.of(value) ?? value };
    })
    .sort((a, b) => collator.compare(a.label, b.label));
}
