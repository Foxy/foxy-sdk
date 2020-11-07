import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCouponItemCategory } from './coupon_item_category';
import type { Graph } from '../../core';

export interface FxCouponItemCategories extends Graph {
  curie: 'fx:coupon_item_categories';
  links: CollectionGraphLinks<FxCouponItemCategories>;
  props: CollectionGraphProps;
  child: FxCouponItemCategory;
}
