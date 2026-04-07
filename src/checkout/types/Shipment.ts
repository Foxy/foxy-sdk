export type Shipment = {
  /** Unique identifier for the saved address, if available. */
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
  /** Selected shipping service ID for when live shipping rates are used. */
  shipping_service_id: number | null;
  /** Whether this shipment contains any shippable items. Non-shippable items, like digital downloads, can still technically form a shipment. */
  has_shippable_items: boolean;
  /** Whether this shipment has items that support live rate calculation. */
  has_live_rate_shippable_items: boolean;
  /** Available region options for the selected country. */
  region_options?: string[];
  /** Available country options for shipping. */
  country_options?: string[];
  /** Available shipping service options for this shipment with their costs. */
  shipping_service_options?: { id: number; name: string; cost: number }[];
};
