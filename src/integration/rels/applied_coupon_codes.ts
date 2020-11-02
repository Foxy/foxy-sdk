import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxAppliedCouponCode } from './applied_coupon_code';

export interface FxAppliedCouponCodes extends APIGraph {
  curie: 'fx:applied_coupon_codes';
  links: APICollectionGraphLinks<FxAppliedCouponCodes>;
  props: APICollectionGraphProps;
  child: FxAppliedCouponCode;
}
