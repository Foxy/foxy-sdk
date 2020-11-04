import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxPaymentMethodSetHostedPaymentGateway } from './payment_method_set_hosted_payment_gateway';
import type { Graph } from '../../core';

export interface FxPaymentMethodSetHostedPaymentGateways extends Graph {
  curie: 'fx:payment_method_set_hosted_payment_gateways';
  links: CollectionGraphLinks<FxPaymentMethodSetHostedPaymentGateways>;
  props: CollectionGraphProps;
  child: FxPaymentMethodSetHostedPaymentGateway;
}
