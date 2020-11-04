import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCoupon } from './coupon';
import type { Graph } from '../../core';

export interface FxCoupons extends Graph {
  curie: 'fx:coupons';
  links: CollectionGraphLinks<FxCoupons>;
  props: CollectionGraphProps;
  child: FxCoupon;
}
