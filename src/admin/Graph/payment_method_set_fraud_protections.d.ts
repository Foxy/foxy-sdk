import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { PaymentMethodSetFraudProtection } from './payment_method_set_fraud_protection';

export interface PaymentMethodSetFraudProtections extends Graph {
  curie: 'fx:payment_method_set_fraud_protections';
  links: CollectionGraphLinks<PaymentMethodSetFraudProtections>;
  props: CollectionGraphProps;
  child: PaymentMethodSetFraudProtection;
}
