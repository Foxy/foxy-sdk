import type { HostedPaymentGateway } from './hosted_payment_gateway';
import type { PaymentMethodSet } from './payment_method_set';
import type { Store } from './store';
import type { Graph } from '../../core';

export interface PaymentMethodSetHostedPaymentGateway extends Graph {
  curie: 'fx:payment_method_set_hosted_payment_gateway';

  links: {
    /** This resource. */
    'self': PaymentMethodSetHostedPaymentGateway;
    /** Related store resource. */
    'fx:store': Store;
    /** Linked payment method set.  */
    'fx:payment_method_set': PaymentMethodSet;
    /** Linked hosted payment gateway. */
    'fx:hosted_payment_gateway': HostedPaymentGateway;
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
