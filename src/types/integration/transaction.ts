import type { FxNativeIntegrations } from "./native_integrations";
import type { FxBillingAddresses } from "./billing_addresses";
import type { FxTransactionLogs } from "./transaction_logs";
import type { FxProcessWebhook } from "./process_webhook";
import type { FxAppliedTaxes } from "./applied_taxes";
import type { FxCustomFields } from "./custom_fields";
import type { FxSendEmails } from "./send_emails";
import type { FxAttributes } from "./attributes";
import type { FxShipments } from "./shipments";
import type { FxDiscounts } from "./discounts";
import type { FxCustomer } from "./customer";
import type { FxPayments } from "./payments";
import type { FxReceipt } from "./receipt";
import type { FxCapture } from "./capture";
import type { FxRefund } from "./refund";
import type { FxStore } from "./store";
import type { FxItems } from "./items";
import type { FxVoid } from "./void";

export interface FxTransaction {
  curie: "fx:transaction";

  links: {
    /** This resource. */
    "self": FxTransaction;
    /** POST here to void this transaction. */
    "fx:void": FxVoid;
    /** Related store resource. */
    "fx:store": FxStore;
    /** List of items in this transaction. */
    "fx:items": FxItems;
    /** POST here to refund this transaction. */
    "fx:refund": FxRefund;
    /** Open this link in a browser to see a receipt for this transaction. */
    "fx:receipt": FxReceipt;
    /** POST here to capture this transaction. */
    "fx:capture": FxCapture;
    /** List of payments for this transaction. */
    "fx:payments": FxPayments;
    /** Related customer resource. */
    "fx:customer": FxCustomer;
    /** List of discounts applied to this transaction. */
    "fx:discounts": FxDiscounts;
    /** List of shipments for this transaction. */
    "fx:shipments": FxShipments;
    /** List of custom attributes on this transaction. */
    "fx:attributes": FxAttributes;
    /** POST here to resend emails for this transaction. */
    "fx:send_emails": FxSendEmails;
    /** List of taxes applied to this transaction. */
    "fx:applied_taxes": FxAppliedTaxes;
    /** List of custom fields on this transaction. */
    "fx:custom_fields": FxCustomFields;
    /** POST here to resend the webhook notification for this transaction. */
    "fx:process_webhook": FxProcessWebhook;
    /** Transaction logs. */
    "fx:transaction_logs": FxTransactionLogs;
    /** List of billing addresses applicable to this transaction. */
    "fx:billing_addresses": FxBillingAddresses;
    /** POST here to resend transaction to the webhooks. */
    "fx:native_integrations": FxNativeIntegrations;
  };

  props: {
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
    type: "updateinfo" | "subscription_modification" | "subscription_renewal" | "subscription_cancellation";
    /** The 3 character ISO code for the currency. */
    currency_code: string;
    /** The currency symbol, such as $, £, €, etc. */
    currency_symbol: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  zooms: {
    billing_addresses?: FxBillingAddresses;
    applied_taxes?: FxAppliedTaxes;
    custom_fields?: FxCustomFields;
    attributes: FxAttributes;
    discounts?: FxDiscounts;
    shipments?: FxShipments;
    customer?: FxCustomer;
    payments?: FxPayments;
    items?: FxItems;
  };
}
