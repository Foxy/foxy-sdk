import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxDiscount } from './discount';
import type { Graph } from '../../core';

export interface FxDiscounts extends Graph {
  curie: 'fx:discounts';
  links: CollectionGraphLinks<FxDiscounts>;
  props: CollectionGraphProps;
  child: FxDiscount;
}
