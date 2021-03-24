import type { Graph } from '../../core';
import type { PaymentGateway } from './payment_gateway';

export interface HostedPaymentGateway extends Graph {
  curie: 'fx:hosted_payment_gateway';
  links: PaymentGateway['links'];
  props: PaymentGateway['props'];
}
