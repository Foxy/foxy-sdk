import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCouponDetail } from './coupon_detail';
import type { Graph } from '../../core';

export interface FxCouponDetails extends Graph {
  curie: 'fx:coupon_details';
  links: CollectionGraphLinks<FxCouponDetails>;
  props: CollectionGraphProps;
  child: FxCouponDetail;
}
