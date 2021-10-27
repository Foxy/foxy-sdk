import type { AppliedTaxes } from './applied_taxes';
import type { Attributes } from './attributes';
import type { BillingAddresses } from './billing_addresses';
import type { Capture } from './capture';
import type { CustomFields } from './custom_fields';
import type { Customer } from './customer';
import type { Discounts } from './discounts';
import type { Graph } from '../../core';
import type { Items } from './items';
import type { NativeIntegrations } from './native_integrations';
import type { Payments } from './payments';
import type { ProcessWebhook } from './process_webhook';
import type { Receipt } from './receipt';
import type { Refund } from './refund';
import type { SendEmails } from './send_emails';
import type { Shipments } from './shipments';
import type { Store } from './store';
import type { TransactionLogs } from './transaction_logs';
import type { Void } from './void';

export interface Transaction extends Graph {
  curie: 'fx:transaction';

  links: {
    /** This resource. */
    'self': Transaction;
    /** POST here to void this transaction. */
    'fx:void': Void;
    /** Related store resource. */
    'fx:store': Store;
    /** List of items in this transaction. */
    'fx:items': Items;
    /** POST here to refund this transaction. */
    'fx:refund': Refund;
    /** Open this link in a browser to see a receipt for this transaction. */
    'fx:receipt': Receipt;
    /** POST here to capture this transaction. */
    'fx:capture': Capture;
    /** List of payments for this transaction. */
    'fx:payments': Payments;
    /** Related customer resource. */
    'fx:customer': Customer;
    /** List of discounts applied to this transaction. */
    'fx:discounts': Discounts;
    /** List of shipments for this transaction. */
    'fx:shipments': Shipments;
    /** List of custom attributes on this transaction. */
    'fx:attributes': Attributes;
    /** POST here to resend emails for this transaction. */
    'fx:send_emails': SendEmails;
    /** List of taxes applied to this transaction. */
    'fx:applied_taxes': AppliedTaxes;
    /** List of custom fields on this transaction. */
    'fx:custom_fields': CustomFields;
    /** POST here to resend the webhook notification for this transaction. */
    'fx:process_webhook': ProcessWebhook;
    /** Transaction logs. */
    'fx:transaction_logs': TransactionLogs;
    /** List of billing addresses applicable to this transaction. */
    'fx:billing_addresses': BillingAddresses;
    /** POST here to resend transaction to the webhooks. */
    'fx:native_integrations': NativeIntegrations;
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
    status: 'approved' | 'authorized' | 'declined' | 'pending' | 'rejected';
    /** The type of transaction that has occurred. */
    type: 'updateinfo' | 'subscription_modification' | 'subscription_renewal' | 'subscription_cancellation';
    /** The 3 character ISO code for the currency. */
    currency_code: string;
    /** The currency symbol, such as $, £, €, etc. */
    currency_symbol: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };

  zooms: {
    billing_addresses?: BillingAddresses;
    applied_taxes?: AppliedTaxes;
    custom_fields?: CustomFields;
    attributes: Attributes;
    discounts?: Discounts;
    shipments?: Shipments;
    customer?: Customer;
    payments?: Payments;
    items?: Items;
  };
}
