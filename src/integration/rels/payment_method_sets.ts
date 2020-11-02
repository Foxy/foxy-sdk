import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxPaymentMethodSet } from './payment_method_set';

export interface FxPaymentMethodSets extends APIGraph {
  curie: 'fx:payment_method_sets';
  links: APICollectionGraphLinks<FxPaymentMethodSets>;
  props: APICollectionGraphProps;
  child: FxPaymentMethodSet;
}
