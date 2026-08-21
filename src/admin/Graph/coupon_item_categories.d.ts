import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { CouponItemCategory } from './coupon_item_category';
import type { Graph } from '../../core';

export interface CouponItemCategories extends Graph {
  curie: 'fx:coupon_item_categories';
  links: CollectionGraphLinks<CouponItemCategories>;
  props: CollectionGraphProps;
  child: CouponItemCategory;
}
