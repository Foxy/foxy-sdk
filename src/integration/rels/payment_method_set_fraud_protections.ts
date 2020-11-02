import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxPaymentMethodSetFraudProtection } from './payment_method_set_fraud_protection';

export interface FxPaymentMethodSetFraudProtections extends APIGraph {
  curie: 'fx:payment_method_set_fraud_protections';
  links: APICollectionGraphLinks<FxPaymentMethodSetFraudProtections>;
  props: APICollectionGraphProps;
  child: FxPaymentMethodSetFraudProtection;
}
