import type { Graph } from '../../core';

export interface DefaultPaymentMethod extends Graph {
  curie: 'fx:default_payment_method';

  links: {
    /** This resource. */
    'self': DefaultPaymentMethod;
    /** Customer using this payment method as default. */
    'fx:customer': Customer;
  };

  props: {
    /** If the customer selected to save their payment information, this will be true. To clear out the payment information, set this to false. */
    save_cc: boolean;
    /** The credit card or debit card type. This will be determined automatically once the payment card is saved. */
    cc_type: string | null;
    /** The payment card number. This property will not be displayed as part of this resource, but can be used to modify this payment method. */
    cc_number?: number;
    /** A masked version of this payment card showing only the last 4 digits. */
    cc_number_masked: string | null;
    /** The payment card expiration month in the MM format. */
    cc_exp_month: string | null;
    /** The payment card expiration year in the YYYY format. */
    cc_exp_year: string | null;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
