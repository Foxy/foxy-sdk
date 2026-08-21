import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { AppliedCouponCode } from './applied_coupon_code';
import type { Graph } from '../../core';

export interface AppliedCouponCodes extends Graph {
  curie: 'fx:applied_coupon_codes';
  links: CollectionGraphLinks<AppliedCouponCodes>;
  props: CollectionGraphProps;
  child: AppliedCouponCode;
}
