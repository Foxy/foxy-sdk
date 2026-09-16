// Every string field below is nullable because the checkout JSON sends an
// empty address field as null, not as an empty string. Narrow before use.
export type BillingAddress = {
  // `use_separate_billing_address` is deliberately NOT here. It reads like a
  // member of this object, but the wire sends it at the top level of the
  // checkout JSON — see `APIJson.use_separate_billing_address`. It was declared
  // here for a while, and every consumer reading it got `undefined`.
  /**
   * Whether the billing address mirrors the customer's shipping address. This
   * is the raw flag, the inverse of the transaction's `use_different_addresses`.
   * It is not the same field as `APIJson.use_separate_billing_address`, which
   * reports true for every cart with no shippable products regardless of the
   * flag. The two agree only on a shippable cart.
   */
  use_customer_shipping_address: boolean;
  /** Unique identifier for the saved address. */
  address_id: number | null;
  /**
   * Name or label for this address. Always null in practice — the checkout
   * JSON hardcodes it empty and the wire turns an empty string into null. It
   * stays declared so the shape matches `Shipment`.
   */
  address_name: string | null;
  /** Recipient's first name. */
  first_name: string | null;
  /** Recipient's last name. */
  last_name: string | null;
  /** Company name for shipping. */
  company: string | null;
  /** Contact phone number. */
  phone: string | null;
  /** Address line 1. */
  address1: string | null;
  /** Address line 2. */
  address2: string | null;
  /** City. */
  city: string | null;
  /** State, region or province. A 2-letter code (if available) or full name. */
  region: string | null;
  /** Postal code or ZIP code. */
  postal_code: string | null;
  /** 2-letter country code. */
  country: string | null;
  /** Available region options for the selected country. */
  region_options?: string[];
  /** Available country options for billing. */
  country_options?: string[];
  /**
   * Whether postal-code lookup applies to this address. Resolved server-side
   * from the store's `postal_code_lookup` setting AND whether this address's
   * country supports lookup at all — the two conditions the shopper sees as
   * one. Absent on payloads from a backend that predates the feature, which
   * reads as disabled.
   */
  postal_code_lookup?: boolean;
};
