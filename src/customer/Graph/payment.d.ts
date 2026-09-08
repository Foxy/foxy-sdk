import type { Graph } from '../../core';
import type { Transaction } from './transaction';

export interface Payment extends Graph {
  curie: 'fx:payment';

  links: {
    /** Related transaction resource. */
    'fx:transaction': Transaction;
  };

  props: {
    /** The payment type for this payment. Values include plastic (for credit/debit cards), purchase_order, paypal, amazon_mws, hosted, ogone, and paypal_ec */
    type: 'plastic' | 'purchase_order' | 'paypal' | 'amazon_mws' | 'hosted' | 'ogone' | 'paypal_ec';
    /** The PO value entered by the customer during checkout (for purchase order payment types). */
    purchase_order: string;
    /** The masked credit card number used for this payment (for plastic payment types). */
    cc_number_masked: string;
    /** The type of credit card such as Visa or MasterCard (for plastic payment types). */
    cc_type: string | null;
    /** The credit card expiration month (for plastic payment types). */
    cc_exp_month: string | null;
    /** The credit card expiration year (for plastic payment types). */
    cc_exp_year: string | null;
    /** The total amount of this payment. */
    amount: number;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
