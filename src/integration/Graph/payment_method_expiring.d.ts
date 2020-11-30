import type { Customer } from './customer';
import type { DefaultBillingAddress } from './default_billing_address';
import type { DefaultPaymentMethod } from './default_payment_method';
import type { Store } from './store';
import type { Subscriptions } from './subscriptions';
import type { Graph } from '../../core';

export interface PaymentMethodExpiring extends Graph {
  curie: 'fx:payment_method_expiring';

  links: {
    /** This resource. */
    'self': PaymentMethodExpiring;
    /** Related store resource. */
    'fx:store': Store;
    /** Customer who this payment method belongs to. */
    'fx:customer': Customer;
    /** List of customer's subscriptions. */
    'fx:subscriptions': Subscriptions;
    /** Customer's default payment method. */
    'fx:default_payment_method': DefaultPaymentMethod;
    /** Customer's default billing address. */
    'fx:default_billing_address': DefaultBillingAddress;
  };

  props: {
    /** Months from today's day before this payment card will expire. */
    months_before_expiration: number;
    /** The customer's given name. */
    first_name: string;
    /** The customer's surname. */
    last_name: string;
    /** The customer's email address. */
    email: string;
    /** The credit card or debit card type. */
    cc_type: string;
    /** A masked version of this payment card showing only the last 4 digits. */
    cc_number_masked: string;
    /** The payment card expiration month in the MM format. */
    cc_exp_month: string;
    /** The payment card expiration year in the YYYY format. */
    cc_exp_year: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
