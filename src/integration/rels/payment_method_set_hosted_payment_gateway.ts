import type { APIGraph } from '../../core/types';
import type { FxHostedPaymentGateway } from './hosted_payment_gateway';
import type { FxPaymentMethodSet } from './payment_method_set';
import type { FxStore } from './store';

export interface FxPaymentMethodSetHostedPaymentGateway extends APIGraph {
  curie: 'fx:payment_method_set_hosted_payment_gateway';

  links: {
    /** This resource. */
    'self': FxPaymentMethodSetHostedPaymentGateway;
    /** Related store resource. */
    'fx:store': FxStore;
    /** Linked payment method set.  */
    'fx:payment_method_set': FxPaymentMethodSet;
    /** Linked hosted payment gateway. */
    'fx:hosted_payment_gateway': FxHostedPaymentGateway;
  };

  props: {
    /** The full API URI of the payment method set associated with this payment method set hosted payment gateway. */
    payment_method_set_uri: string;
    /** The full API URI of the hosted payment gateway associated with this payment method set hosted payment gateway. */
    hosted_payment_gateway_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
