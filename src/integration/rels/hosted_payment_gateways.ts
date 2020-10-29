import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxHostedPaymentGateway } from './hosted_payment_gateway';

export interface FxHostedPaymentGateways {
  curie: 'fx:hosted_payment_gateways';
  links: CollectionLinks<FxHostedPaymentGateways>;
  props: CollectionProps;
  child: FxHostedPaymentGateway;
}
