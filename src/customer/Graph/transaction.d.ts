import type { Attributes } from './attributes';
import type { CustomFields } from './custom_fields';
import type { Graph as Customer } from './index';
import type { Graph } from '../../core';
import type { Items } from './items';

export interface Transaction extends Graph {
  curie: 'fx:transaction';

  links: {
    /** This resource. */
    'self': Transaction;
    /** List of items in this transaction. */
    'fx:items': Items;
    /** Open this link in a browser to see a receipt for this transaction. */
    'fx:receipt': Receipt;
    /** Related customer resource. */
    'fx:customer': Customer;
    /** List of custom attributes on this transaction. */
    'fx:attributes': Attributes;
    /** List of custom fields on this transaction. */
    'fx:custom_fields': CustomFields;
  };

  props: {
    /** The order number. */
    id: number;
    /** If custom transaction IDs, prefixes, or suffixes have been configured, this value will contain the custom ID (which may be a string). Otherwise it will be identical to the id value (an integer). */
    display_id: string | number;
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
    status:
      | ''
      | 'capturing'
      | 'captured'
      | 'approved'
      | 'authorized'
      | 'pending'
      | 'completed'
      | 'problem'
      | 'pending_fraud_review'
      | 'rejected'
      | 'declined'
      | 'refunding'
      | 'refunded'
      | 'voided'
      | 'verified';
    /** The type of transaction that has occurred. */
    type: '' | 'updateinfo' | 'subscription_modification' | 'subscription_renewal' | 'subscription_cancellation';
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
    custom_fields?: CustomFields;
    attributes: Attributes;
    customer?: Customer;
    items?: Items;
  };
}
