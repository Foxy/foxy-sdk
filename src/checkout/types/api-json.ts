import type { BillingAddress } from './billing-address';
import type { CustomConfig } from './custom-config';
import type { CustomFields } from './custom-fields';
import type { Customer } from './customer';
import type { Display } from './display';
import type { Format } from './format';
import type { ExpressCheckoutOption } from './express-checkout-option';
import type { Item } from './item';
import type { Message } from './message';
import type { PaymentOption } from './payment-option';
import type { Session } from './session';
import type { Shipment } from './shipment';
import type { Store } from './store';
import type { TemplateSet } from './template-set';
import type { Totals } from './totals';
import type { Transaction } from './transaction';

export type APIJson = {
  /** Public template set info (fx:template_set). */
  template_set: TemplateSet;
  /** Public transaction details including ID, date and payments – available after purchase. */
  transaction?: Transaction;
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
  /** Payment options available for this order. */
  payment_options?: PaymentOption[];
  /** Express checkout options available for this order. */
  express_checkout_options?: ExpressCheckoutOption[];
};
