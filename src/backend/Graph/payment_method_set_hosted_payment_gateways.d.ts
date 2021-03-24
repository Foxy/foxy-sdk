import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { PaymentMethodSetHostedPaymentGateway } from './payment_method_set_hosted_payment_gateway';

export interface PaymentMethodSetHostedPaymentGateways extends Graph {
  curie: 'fx:payment_method_set_hosted_payment_gateways';
  links: CollectionGraphLinks<PaymentMethodSetHostedPaymentGateways>;
  props: CollectionGraphProps;
  child: PaymentMethodSetHostedPaymentGateway;
}
