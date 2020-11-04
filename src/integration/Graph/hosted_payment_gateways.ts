import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxHostedPaymentGateway } from './hosted_payment_gateway';
import type { Graph } from '../../core';

export interface FxHostedPaymentGateways extends Graph {
  curie: 'fx:hosted_payment_gateways';
  links: CollectionGraphLinks<FxHostedPaymentGateways>;
  props: CollectionGraphProps;
  child: FxHostedPaymentGateway;
}
