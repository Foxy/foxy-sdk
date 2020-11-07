import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxPaymentMethodSet } from './payment_method_set';
import type { Graph } from '../../core';

export interface FxPaymentMethodSets extends Graph {
  curie: 'fx:payment_method_sets';
  links: CollectionGraphLinks<FxPaymentMethodSets>;
  props: CollectionGraphProps;
  child: FxPaymentMethodSet;
}
