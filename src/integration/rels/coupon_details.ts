import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCouponDetail } from './coupon_detail';

export interface FxCouponDetails extends APIGraph {
  curie: 'fx:coupon_details';
  links: APICollectionGraphLinks<FxCouponDetails>;
  props: APICollectionGraphProps;
  child: FxCouponDetail;
}
