import { FxPaymentGateway } from './payment_gateway';
import type { Graph } from '../../core';

export interface FxHostedPaymentGateway extends Graph {
  curie: 'fx:hosted_payment_gateway';
  links: FxPaymentGateway['links'];
  props: FxPaymentGateway['props'];
}
