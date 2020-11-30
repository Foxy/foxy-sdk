import type { Graph } from '../../core';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface Payment extends Graph {
  curie: 'fx:payment';

  links: {
    /** This resource. */
    'self': Payment;
    /** Store that received this payment. */
    'fx:store': Store;
    /** Related transaction resource. */
    'fx:transaction': Transaction;
  };

  props: {
    /** The payment type for this payment. Values include plastic (for credit/debit cards), purchase_order, paypal, amazon_mws, hosted, ogone, and paypal_ec */
    type: 'plastic' | 'purchase_order' | 'paypal' | 'amazon_mws' | 'hosted' | 'ogone' | 'paypal_ec';
    /** The payment gateway type for this payment. This should correspond to a value in {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/hosted_payment_gateways hosted_payment_gateways} or {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways}. */
    gateway_type: string;
    /** The processor response string from the payment gateway. This will include their transaction or reference number. */
    processor_response: string;
    /** If supported by the payment gateway integration, this will include additional information from the payment gateway's response. */
    processor_response_details: string;
    /** The PO value entered by the customer during checkout (for purchase order payment types). */
    purchase_order: string;
    /** The masked credit card number used for this payment (for plastic payment types). */
    cc_number_masked: string;
    /** The type of credit card such as Visa or MasterCard (for plastic payment types). */
    cc_type: string;
    /** The credit card expiration month (for plastic payment types). */
    cc_exp_month: string;
    /** The credit card expiration year (for plastic payment types). */
    cc_exp_year: string;
    /** If this payment gateway set is configured with a fraud protection system, the fraud score for this payment will be listed here. */
    fraud_protection_score: number;
    /** The payer id for this payment (for Paypal payment types). */
    paypal_payer_id: string;
    /** The identifer for the third party provider for this payment (for hosted payment types). */
    third_party_id: string;
    /** The total amount of this payment. */
    amount: number;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
