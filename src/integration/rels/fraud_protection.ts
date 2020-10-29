import type { FxPaymentMethodSets } from './payment_method_sets';
import type { FxStore } from './store';

export interface FxFraudProtection {
  curie: 'fx:fraud_protection';

  links: {
    /** This resource. */
    'self': FxFraudProtection;
    /** Store this fraud protection policy was set on. */
    'fx:store': FxStore;
    /** Payment method sets these fraud protection measures are enabled on. */
    'fx:payment_method_sets': FxPaymentMethodSets;
  };

  props: {
    /** The type of this fraud protection */
    type: 'minfraud' | 'google_recaptcha' | 'custom_precheckout_hook';
    /** Description of this fraud protection */
    description: string;
    /** Configuration settings for some fraud protection systems. */
    json: string;
    /** The score threshold used for minfraud. This should be set between 0 and 100. 0 will disable minFraud and 100 will turn it on for logging but still allow all transactions to go through. */
    score_threshold_reject: number;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
