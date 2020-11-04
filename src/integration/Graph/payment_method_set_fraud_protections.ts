import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxPaymentMethodSetFraudProtection } from './payment_method_set_fraud_protection';
import type { Graph } from '../../core';

export interface FxPaymentMethodSetFraudProtections extends Graph {
  curie: 'fx:payment_method_set_fraud_protections';
  links: CollectionGraphLinks<FxPaymentMethodSetFraudProtections>;
  props: CollectionGraphProps;
  child: FxPaymentMethodSetFraudProtection;
}
