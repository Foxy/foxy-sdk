import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { PaymentGateway } from './payment_gateway';
import type { Graph } from '../../core';

export interface PaymentGateways extends Graph {
  curie: 'fx:payment_gateways';
  links: CollectionGraphLinks<PaymentGateways>;
  props: CollectionGraphProps;
  child: PaymentGateway;
}
