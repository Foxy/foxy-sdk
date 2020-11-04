import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxPaymentGateway } from './payment_gateway';
import type { Graph } from '../../core';

export interface FxPaymentGateways extends Graph {
  curie: 'fx:payment_gateways';
  links: CollectionGraphLinks<FxPaymentGateways>;
  props: CollectionGraphProps;
  child: FxPaymentGateway;
}
