import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { PaymentMethodSet } from './payment_method_set';
import type { Graph } from '../../core';

export interface PaymentMethodSets extends Graph {
  curie: 'fx:payment_method_sets';
  links: CollectionGraphLinks<PaymentMethodSets>;
  props: CollectionGraphProps;
  child: PaymentMethodSet;
}
