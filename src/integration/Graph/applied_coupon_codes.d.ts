import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxAppliedCouponCode } from './applied_coupon_code';
import type { Graph } from '../../core';

export interface FxAppliedCouponCodes extends Graph {
  curie: 'fx:applied_coupon_codes';
  links: CollectionGraphLinks<FxAppliedCouponCodes>;
  props: CollectionGraphProps;
  child: FxAppliedCouponCode;
}
