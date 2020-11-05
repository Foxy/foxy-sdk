import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCouponCode } from './coupon_code';
import type { Graph } from '../../core';

export interface FxCouponCodes extends Graph {
  curie: 'fx:coupon_codes';
  links: CollectionGraphLinks<FxCouponCodes>;
  props: CollectionGraphProps;
  child: FxCouponCode;
}
