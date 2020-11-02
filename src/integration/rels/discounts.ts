import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxDiscount } from './discount';

export interface FxDiscounts extends APIGraph {
  curie: 'fx:discounts';
  links: APICollectionGraphLinks<FxDiscounts>;
  props: APICollectionGraphProps;
  child: FxDiscount;
}
