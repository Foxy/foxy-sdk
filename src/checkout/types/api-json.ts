import type { Item } from "./item";
import type { Shipment } from "./shipment";
import type { BillingAddress } from "./billing-address";
import type { Store } from "./store";
import type { Message } from "./message";
import type { Format } from "./format";
import type { Display } from "./display";
import type { PaymentMethod } from "./payment-method";
import type { PaymentOption } from "./payment-option";
import type { TemplateSet } from "./template-set";
import type { Transaction } from "./transaction";
import type { Session } from "./session";
import type { Customer } from "./customer";
import type { Totals } from "./totals";
import type { CustomFields } from "./custom-fields";
import type { CustomConfig } from "./custom-config";

type DeepReadonly<T> =
  T extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

export type APIJson = DeepReadonly<{
  /** Public template set info (fx:template_set). */
  template_set: TemplateSet;
  /** Public transaction details including ID and date when available. */
  transaction: Transaction;
  /** The session information including name (fcsid) and unique identifier. */
  session: Session;
  /** Whether debug mode is enabled for this template set. */
  debug: boolean;
  /** Current customer information. */
  customer: Customer;
  /** Array of shipment addresses and their associated details. */
  shipments: Shipment[];
  /** Array of cart items. */
  items: Item[];
  /** Array of totals for this order, ordered from current to future. */
  totals: Totals[];
  /** Billing address information. */
  billing_address: BillingAddress;
  /** Store configuration and information. */
  store: Store;
  /** Array of messages (errors, warnings, or informational). */
  messages: Message[];
  /** Custom fields with keys prefixed by 'h:'. */
  custom_fields: CustomFields;
  /** Formatting and localization settings. */
  format: Format;
  /** Display and UI configuration options. */
  display: Display;
  /** Custom configuration options for this checkout. */
  custom_config: CustomConfig;
  /** Selected payment method details (only present if a payment method has been selected). */
  payment_method?: PaymentMethod;
  /** Payment option configuration for this checkout (e.g. which ACH fields to render). */
  payment_options?: PaymentOption[];
}>;
