import type * as FxNativeIntegrations from "./native_integrations";
import type * as FxBillingAddresses from "./billing_addresses";
import type * as FxTransactionLogs from "./transaction_logs";
import type * as FxProcessWebhook from "./process_webhook";
import type * as FxAppliedTaxes from "./applied_taxes";
import type * as FxCustomFields from "./custom_fields";
import type * as FxSendEmails from "./send_emails";
import type * as FxAttributes from "./attributes";
import type * as FxShipments from "./shipments";
import type * as FxDiscounts from "./discounts";
import type * as FxCustomer from "./customer";
import type * as FxPayments from "./payments";
import type * as FxReceipt from "./receipt";
import type * as FxCapture from "./capture";
import type * as FxRefund from "./refund";
import type * as FxStore from "./store";
import type * as FxItems from "./items";
import type * as FxVoid from "./void";

export type Rel = "transaction";
export type Curie = "fx:transaction";
export type Methods = "GET" | "PUT" | "POST" | "HEAD" | "PATCH" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** POST here to void this transaction. */
  "fx:void": FxVoid.Links;
  /** Related store resource. */
  "fx:store": FxStore.Links;
  /** List of items in this transaction. */
  "fx:items": FxItems.Links;
  /** POST here to refund this transaction. */
  "fx:refund": FxRefund.Links;
  /** Open this link in a browser to see a receipt for this transaction. */
  "fx:receipt": FxReceipt.Links;
  /** POST here to capture this transaction. */
  "fx:capture": FxCapture.Links;
  /** List of payments for this transaction. */
  "fx:payments": FxPayments.Links;
  /** Related customer resource. */
  "fx:customer": FxCustomer.Links;
  /** List of discounts applied to this transaction. */
  "fx:discounts": FxDiscounts.Links;
  /** List of shipments for this transaction. */
  "fx:shipments": FxShipments.Links;
  /** List of custom attributes on this transaction. */
  "fx:attributes": FxAttributes.Links;
  /** POST here to resend emails for this transaction. */
  "fx:send_emails": FxSendEmails.Links;
  /** List of taxes applied to this transaction. */
  "fx:applied_taxes": FxAppliedTaxes.Links;
  /** List of custom fields on this transaction. */
  "fx:custom_fields": FxCustomFields.Links;
  /** POST here to resend the webhook notification for this transaction. */
  "fx:process_webhook": FxProcessWebhook.Links;
  /** Transaction logs. */
  "fx:transaction_logs": FxTransactionLogs.Links;
  /** List of billing addresses applicable to this transaction. */
  "fx:billing_addresses": FxBillingAddresses.Links;
  /** POST here to resend transaction to the webhooks. */
  "fx:native_integrations": FxNativeIntegrations.Links;
}

export interface Props {
  /** The order number. */
  id: number;
  /** True if this transaction was a test transaction and not run against a live payment gateway. */
  is_test: boolean;
  /** Set this to true to hide it in the FoxyCart admin. */
  hide_transaction: boolean;
  /** If the webhook for this transaction has been successfully sent, this will be true. You can also modify this to meet your needs. */
  data_is_fed: boolean;
  /** The date of this transaction shown in the timezone of the store. The format used is ISO 8601 (or 'c' format string for PHP developers). */
  transaction_date: string;
  /** The locale code of this transaction. This will be a copy of the store's local_code at the time of the transaction. */
  locale_code: string;
  /** The customer's given name at the time of the transaction. */
  customer_first_name: string;
  /** The customer's surname at the time of the transaction. */
  customer_last_name: string;
  /** If the customer provided a tax_id during checkout, it will be included here. */
  customer_tax_id: string;
  /** The customer's email address at the time of the transaction. */
  customer_email: string;
  /** The customer's ip address at the time of the transaction. */
  customer_ip: string;
  /** The country of the customer's ip address. */
  ip_country: string;
  /** Total amount of the items in this transaction. */
  total_item_price: string;
  /** Total amount of the taxes for this transaction. */
  total_tax: string;
  /** Total amount of the shipping costs for this transaction. */
  total_shipping: string;
  /** If this transaction has any shippable subscription items which will process in the future, this will be the total amount of shipping costs for those items. */
  total_future_shipping: string;
  /** Total amount of this transaction including all items, taxes, shipping costs and discounts. */
  total_order: number;
  /** Used for transactions processed with a hosted payment gateway which can change the status of the transaction after it is originally posted. If the status is empty, a normal payment gateway was used and the transaction should be considered completed. */
  status: "approved" | "authorized" | "declined" | "pending" | "rejected";
  /** The type of transaction that has occurred. */
  type:
    | "updateinfo"
    | "subscription_modification"
    | "subscription_renewal"
    | "subscription_cancellation";
  /** The 3 character ISO code for the currency. */
  currency_code: string;
  /** The currency symbol, such as $, £, €, etc. */
  currency_symbol: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
