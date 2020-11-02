import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCoupon } from './coupon';

export interface FxCoupons extends APIGraph {
  curie: 'fx:coupons';
  links: APICollectionGraphLinks<FxCoupons>;
  props: APICollectionGraphProps;
  child: FxCoupon;
}
