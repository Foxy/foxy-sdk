import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxPaymentMethodSetFraudProtection } from './payment_method_set_fraud_protection';

export interface FxPaymentMethodSetFraudProtections {
  curie: 'fx:payment_method_set_fraud_protections';
  links: CollectionLinks<FxPaymentMethodSetFraudProtections>;
  props: CollectionProps;
  child: FxPaymentMethodSetFraudProtection;
}
