/**
 * One city/region candidate for a postal code.
 *
 * Deliberately narrow. The lookup sources behind it — a US tax table and
 * GeoNames — return a city and a region and nothing else, so the shape carries
 * no street fields: committing an empty `address1` over a shopper's typed
 * street address is a data-loss bug, not a no-op.
 *
 * No display name for the region either. The client maps the code through its
 * own region catalog, which renders in the shopper's locale; a name from the
 * server arrives in whatever language the source chose.
 */
export type AddressSuggestion = {
  /** City name. Never empty — an entry without one is not a suggestion. */
  city: string;
  /**
   * Region code from the same vocabulary as the address's `region_options`, or
   * `""` when the source has no region for this postal code.
   */
  region: string;
};
