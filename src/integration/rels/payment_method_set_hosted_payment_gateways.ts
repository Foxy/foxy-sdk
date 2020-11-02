import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxPaymentMethodSetHostedPaymentGateway } from './payment_method_set_hosted_payment_gateway';

export interface FxPaymentMethodSetHostedPaymentGateways extends APIGraph {
  curie: 'fx:payment_method_set_hosted_payment_gateways';
  links: APICollectionGraphLinks<FxPaymentMethodSetHostedPaymentGateways>;
  props: APICollectionGraphProps;
  child: FxPaymentMethodSetHostedPaymentGateway;
}
