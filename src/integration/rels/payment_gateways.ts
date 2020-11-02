import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxPaymentGateway } from './payment_gateway';

export interface FxPaymentGateways extends APIGraph {
  curie: 'fx:payment_gateways';
  links: APICollectionGraphLinks<FxPaymentGateways>;
  props: APICollectionGraphProps;
  child: FxPaymentGateway;
}
