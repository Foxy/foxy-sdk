import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCouponItemCategory } from './coupon_item_category';

export interface FxCouponItemCategories extends APIGraph {
  curie: 'fx:coupon_item_categories';
  links: APICollectionGraphLinks<FxCouponItemCategories>;
  props: APICollectionGraphProps;
  child: FxCouponItemCategory;
}
