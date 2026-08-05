export type BillingAddress = {
  // `use_separate_billing_address` is deliberately NOT here. It reads like a
  // member of this object, but the wire sends it at the top level of the
  // checkout JSON — see `APIJson.use_separate_billing_address`. It was declared
  // here for a while, and every consumer reading it got `undefined`.
  /** Unique identifier for the saved address. */
  address_id: number | null;
  /** Name or label for this address. */
  address_name: string;
  /** Recipient's first name. */
  first_name: string;
  /** Recipient's last name. */
  last_name: string;
  /** Company name for shipping. */
  company: string;
  /** Contact phone number. */
  phone: string;
  /** Address line 1. */
  address1: string;
  /** Address line 2. */
  address2: string;
  /** City. */
  city: string;
  /** State, region or province. A 2-letter code (if available) or full name. */
  region: string;
  /** Postal code or ZIP code. */
  postal_code: string;
  /** 2-letter country code. */
  country: string;
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
