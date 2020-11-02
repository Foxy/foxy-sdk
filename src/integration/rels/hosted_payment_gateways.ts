import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxHostedPaymentGateway } from './hosted_payment_gateway';

export interface FxHostedPaymentGateways extends APIGraph {
  curie: 'fx:hosted_payment_gateways';
  links: APICollectionGraphLinks<FxHostedPaymentGateways>;
  props: APICollectionGraphProps;
  child: FxHostedPaymentGateway;
}
