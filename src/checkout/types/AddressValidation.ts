/**
 * An address as a validation provider returns it.
 *
 * Wire-shaped and every field optional, for the same reason `AddressSuggestion`
 * is deliberately narrow: a provider that has no opinion about a field omits
 * it, and writing an empty string over a shopper's typed value is a data-loss
 * bug rather than a no-op.
 */
export type ValidatedAddress = {
  address1?: string;
  address2?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
};

/**
 * The store's validation verdict on one address, computed server-side where
 * the address was stored.
 *
 * `suggestion` is present only when `status` is `"suggested"`. The whole
 * object is absent from an address when there is nothing to say — validation
 * is off for the store, the country is not covered, the address is not
 * complete, or the provider did not answer in time.
 */
export type AddressValidation = {
  status: "ok" | "suggested" | "failed";
  suggestion?: ValidatedAddress;
};
