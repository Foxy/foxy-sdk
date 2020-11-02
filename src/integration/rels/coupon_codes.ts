import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCouponCode } from './coupon_code';

export interface FxCouponCodes extends APIGraph {
  curie: 'fx:coupon_codes';
  links: APICollectionGraphLinks<FxCouponCodes>;
  props: APICollectionGraphProps;
  child: FxCouponCode;
}
