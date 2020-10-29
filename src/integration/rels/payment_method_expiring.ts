import type { FxDefaultBillingAddress } from './default_billing_address';
import type { FxDefaultPaymentMethod } from './default_payment_method';
import type { FxSubscriptions } from './subscriptions';
import type { FxCustomer } from './customer';
import type { FxStore } from './store';

export interface FxPaymentMethodExpiring {
  curie: 'fx:payment_method_expiring';

  links: {
    /** This resource. */
    'self': FxPaymentMethodExpiring;
    /** Related store resource. */
    'fx:store': FxStore;
    /** Customer who this payment method belongs to. */
    'fx:customer': FxCustomer;
    /** List of customer's subscriptions. */
    'fx:subscriptions': FxSubscriptions;
    /** Customer's default payment method. */
    'fx:default_payment_method': FxDefaultPaymentMethod;
    /** Customer's default billing address. */
    'fx:default_billing_address': FxDefaultBillingAddress;
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
