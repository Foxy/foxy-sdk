import type { FxPaymentMethodSet } from './payment_method_set';
import type { FxFraudProtection } from './fraud_protection';
import type { FxStore } from './store';

export interface FxPaymentMethodSetFraudProtection {
  curie: 'fx:payment_method_set_fraud_protection';

  links: {
    /** This resource. */
    'self': FxPaymentMethodSetFraudProtection;
    /** Store this configuration belongs to. */
    'fx:store': FxStore;
    /** Fraud protection configuration. */
    'fx:fraud_protection': FxFraudProtection;
    /** Payment method set configuration. */
    'fx:payment_method_set': FxPaymentMethodSet;
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
