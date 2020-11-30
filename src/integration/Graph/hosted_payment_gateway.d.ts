import { PaymentGateway } from './payment_gateway';
import type { Graph } from '../../core';

export interface HostedPaymentGateway extends Graph {
  curie: 'fx:hosted_payment_gateway';
  links: PaymentGateway['links'];
  props: PaymentGateway['props'];
}
