import type { AddressValidation } from "./AddressValidation";

// Every address string on this object is nullable: the checkout JSON turns an
// empty address field into null rather than sending an empty string. The same
// goes for the service option name below. Narrow before use.
export type Shipment = {
  /** Unique identifier for the saved address, if available. */
  address_id: number | null;
  /**
   * Name or label for this address. Null on a non-multiship transaction,
   * which reports a single unnamed shipment built from the customer's
   * shipping contact rather than from a named `shipto`.
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
  /**
   * Whether postal-code lookup applies to this address. Resolved server-side
   * from the store's `postal_code_lookup` setting AND whether this address's
   * country supports lookup at all — the two conditions the shopper sees as
   * one. Absent on payloads from a backend that predates the feature, which
   * reads as disabled.
   */
  postal_code_lookup?: boolean;
  /**
   * The store's validation verdict on this address. Absent when there is
   * nothing to say — validation is off, the country is not covered, the
   * address is incomplete, or the provider did not answer in time. Absent is
   * also what a backend predating the feature sends, which reads as "off".
   */
  address_validation?: AddressValidation;
  /** Available shipping service options for this shipment with their costs. */
  shipping_service_options?: {
    id: number;
    name: string | null;
    cost: number;
  }[];
};
