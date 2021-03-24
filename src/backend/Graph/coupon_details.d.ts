import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { CouponDetail } from './coupon_detail';
import type { Graph } from '../../core';

export interface CouponDetails extends Graph {
  curie: 'fx:coupon_details';
  links: CollectionGraphLinks<CouponDetails>;
  props: CollectionGraphProps;
  child: CouponDetail;
}
