import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxPaymentMethodSet } from './payment_method_set';

export interface FxPaymentMethodSets {
  curie: 'fx:payment_method_sets';
  links: CollectionLinks<FxPaymentMethodSets>;
  props: CollectionProps;
  child: FxPaymentMethodSet;
}
