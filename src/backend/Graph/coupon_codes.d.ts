import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { CouponCode } from './coupon_code';
import type { Graph } from '../../core';

export interface CouponCodes extends Graph {
  curie: 'fx:coupon_codes';
  links: CollectionGraphLinks<CouponCodes>;
  props: CollectionGraphProps;
  child: CouponCode;
}
