export type RegionType = "state" | "province" | "county" | "canton" | "prefecture";

export type RegionOption = {
  /** The code exactly as it must be sent back to the API. */
  value: string;
  /** react-intl message id for the human-readable name. */
  messageId: string;
};

const DEFAULT_REGION_TYPE: RegionType = "state";

/**
 * Foxy's own region-bearing countries and the label each uses. Only 12 of 254
 * countries have regions at all.
 *
 * This exists because `r.lang` is not in the checkout payload — property
 * helpers expose it as `regions_type`, but that is the authenticated hAPI and
 * unreachable from an anonymous checkout. Delete this map once the backend
 * sends `regions_type` alongside `region_options`.
 */
export const REGION_TYPE_BY_COUNTRY: Readonly<Record<string, RegionType>> = {
  AT: "state",
  AU: "state",
  BQ: "state",
  CA: "province",
  CH: "canton",
  DE: "state",
  ES: "province",
  IE: "county",
  IN: "state",
  JP: "prefecture",
  NO: "county",
  US: "state",
};

/**
 * Builds the react-intl message id for one region's name.
 *
 * THE GENERATOR AND THE RUNTIME LOOKUP BOTH CALL THIS. If two
 * implementations of this rule ever exist, every label silently degrades to a
 * raw code — no throw, no failing test. Keep it single-sourced.
 *
 * Region codes are not uniform: 2-letter (`MN`), 3-letter (`NSW`),
 * single-letter (`D`), numeric (`23`), and in Spain's case the name itself
 * (`A Coruna`). Lowercasing and collapsing non-alphanumeric runs yields a
 * stable, collision-free key for all 330 of Foxy's entries.
 */
export function regionMessageId(countryCode: string, regionCode: string): string {
  const country = String(countryCode).toLowerCase();
  const region = String(regionCode)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `region_${country}_${region}`;
}

/**
 * The message id for the region FIELD's label, e.g. "State" for the US,
 * "Prefecture" for Japan.
 *
 * These ids already exist in Foxy's language strings and already arrive in
 * every checkout payload's `language_strings`, so they are translated and
 * store-overridable already — no new messages are introduced.
 */
export function regionLabelMessageId(countryCode: string): string {
  const type =
    REGION_TYPE_BY_COUNTRY[String(countryCode).trim().toUpperCase()] ?? DEFAULT_REGION_TYPE;

  return `checkout_location_${type}`;
}

/**
 * Maps `Shipment.region_options` / `BillingAddress.region_options` to
 * `{ value, messageId }` pairs.
 *
 * The value is trimmed and OTHERWISE UNTOUCHED. Unlike country codes it must
 * never be uppercased: Spain's codes are human-readable names containing
 * spaces, and uppercasing them makes them unmatchable against the very list
 * they came from.
 *
 * Input order is preserved rather than sorted. There is no localized name at
 * this layer to sort by — the caller has the react-intl context, not the SDK.
 *
 * Returns an empty array for anything that is not an array of usable codes,
 * so callers can branch on `.length` and keep a plain-text fallback.
 */
export function toRegionOptions(codes: unknown, countryCode: string): RegionOption[] {
  if (!Array.isArray(codes)) return [];

  return codes
    .filter((code): code is string => typeof code === "string" && code.trim() !== "")
    .map((code) => {
      const value = code.trim();
      return { value, messageId: regionMessageId(countryCode, value) };
    });
}

const regionMessagesByLocale = new Map<string, Promise<Record<string, string>>>();

// Static map rather than a template-literal `import()`: the set of shipped
// catalogs is known at build time, and an explicit map lets the bundler emit
// exactly one lazy chunk per locale with no dynamic-path guesswork.
const REGION_CATALOG_LOADERS: Record<string, () => Promise<{ default: Record<string, string> }>> =
  {
    "en-US": () => import("./locales/regions/en-US.json"),
  };

/**
 * Lazily loads the region-name catalog for `locale`.
 *
 * Each catalog is a separate chunk, so locales a shopper never sees are never
 * downloaded. Falls back to the base language (`en-GB` → `en-US`) and then to
 * an empty object — a missing catalog is not an error, it just leaves labels
 * showing their codes, which is the pre-existing behavior.
 */
export function loadRegionMessages(locale: string): Promise<Record<string, string>> {
  const requested = String(locale).replace(/_/g, "-").trim();
  const base = requested.split("-")[0] ?? "";

  const matched = Object.keys(REGION_CATALOG_LOADERS).find(
    (available) =>
      available.toLowerCase() === requested.toLowerCase() ||
      available.toLowerCase().split("-")[0] === base.toLowerCase(),
  );

  if (!matched) return Promise.resolve({});

  const cached = regionMessagesByLocale.get(matched);
  if (cached) return cached;

  const loading = REGION_CATALOG_LOADERS[matched]!()
    .then((module) => module.default)
    // A chunk that fails to load must not break the field; codes remain.
    .catch(() => ({}) as Record<string, string>);

  regionMessagesByLocale.set(matched, loading);
  return loading;
}
