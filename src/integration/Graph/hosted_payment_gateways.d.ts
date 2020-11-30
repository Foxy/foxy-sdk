import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { HostedPaymentGateway } from './hosted_payment_gateway';

export interface HostedPaymentGateways extends Graph {
  curie: 'fx:hosted_payment_gateways';
  links: CollectionGraphLinks<HostedPaymentGateways>;
  props: CollectionGraphProps;
  child: HostedPaymentGateway;
}
