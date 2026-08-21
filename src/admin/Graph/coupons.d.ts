import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Coupon } from './coupon';
import type { Graph } from '../../core';

export interface Coupons extends Graph {
  curie: 'fx:coupons';
  links: CollectionGraphLinks<Coupons>;
  props: CollectionGraphProps;
  child: Coupon;
}
