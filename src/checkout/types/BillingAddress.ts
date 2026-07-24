export type BillingAddress = {
  /** Whether the shopper is entering a billing address separate from shipping. */
  use_separate_billing_address: boolean;
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
};
