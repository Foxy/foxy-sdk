import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { PaymentGateway } from './payment_gateway';

export interface PaymentGateways extends Graph {
  curie: 'fx:payment_gateways';
  links: CollectionGraphLinks<PaymentGateways>;
  props: CollectionGraphProps;
  child: PaymentGateway;
}
