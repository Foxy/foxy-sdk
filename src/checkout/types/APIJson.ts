import type { BillingAddress } from "./BillingAddress";
import type { CustomConfig } from "./CustomConfig";
import type { CustomFields } from "./CustomFields";
import type { Customer } from "./Customer";
import type { Display } from "./Display";
import type { Format } from "./Format";
import type { Item } from "./Item";
import type { Message } from "./Message";
import type { NextAction } from "./NextAction";
import type { PaymentGatewayConfig } from "./PaymentGatewayConfig";
import type { SavedPaymentMethod } from "./SavedPaymentMethod";
import type { Session } from "./Session";
import type { Shipment } from "./Shipment";
import type { Store } from "./Store";
import type { TemplateSet } from "./TemplateSet";
import type { Totals } from "./Totals";
import type { Transaction } from "./Transaction";

export type APIJson = {
  /** Public template set info (fx:template_set). */
  template_set: TemplateSet;
  /** Public transaction details including ID, date and payments – available after purchase. */
  transaction: Transaction | null;
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
  /** Saved payment methods available for this order. */
  saved_payment_methods: SavedPaymentMethod[] | null;
  /** Payment gateway configurations available for this order. */
  payment_gateways: PaymentGatewayConfig[] | null;
  /** Language strings for localization, keyed by string identifiers. */
  language_strings: Record<string, string>;
  /** Follow-up action the client must complete before the checkout submission resolves. */
  next_action?: NextAction | null;
};
