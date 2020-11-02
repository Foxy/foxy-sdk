import type { APIGraph } from '../../core/types';
import { FxPaymentGateway } from './payment_gateway';

export interface FxHostedPaymentGateway extends APIGraph {
  curie: 'fx:hosted_payment_gateway';
  links: FxPaymentGateway['links'];
  props: FxPaymentGateway['props'];
}
