import type { Graph } from '../../core';
import type { ConnectGateway } from './connect_gateway';
import type { PaymentGateway } from './payment_gateway';

export interface HostedPaymentGateway extends Graph {
  curie: 'fx:hosted_payment_gateway';
  links: PaymentGateway['links'] & {
    /** POST here to get a URL that reconnects this gateway. Present only for gateway types that support OAuth-style connections, so check for it before use. */
    'fx:connect_gateway': ConnectGateway;
  };
  props: PaymentGateway['props'];
}
