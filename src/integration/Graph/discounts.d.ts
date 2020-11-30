import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Discount } from './discount';
import type { Graph } from '../../core';

export interface Discounts extends Graph {
  curie: 'fx:discounts';
  links: CollectionGraphLinks<Discounts>;
  props: CollectionGraphProps;
  child: Discount;
}
