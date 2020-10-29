import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxPaymentGateway } from './payment_gateway';

export interface FxPaymentGateways {
  curie: 'fx:payment_gateways';
  links: CollectionLinks<FxPaymentGateways>;
  props: CollectionProps;
  child: FxPaymentGateway;
}
