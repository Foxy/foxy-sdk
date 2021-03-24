import type { FraudProtection } from './fraud_protection';
import type { Graph } from '../../core';
import type { PaymentMethodSet } from './payment_method_set';
import type { Store } from './store';

export interface PaymentMethodSetFraudProtection extends Graph {
  curie: 'fx:payment_method_set_fraud_protection';

  links: {
    /** This resource. */
    'self': PaymentMethodSetFraudProtection;
    /** Store this configuration belongs to. */
    'fx:store': Store;
    /** Fraud protection configuration. */
    'fx:fraud_protection': FraudProtection;
    /** Payment method set configuration. */
    'fx:payment_method_set': PaymentMethodSet;
  };

  props: {
    /** The full API URI of the payment method set associated with this payment method set fraud protection. */
    payment_method_set_uri: string;
    /** The full API URI of the fraud protection associated with this payment method set fraud protection. */
    fraud_protection_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
