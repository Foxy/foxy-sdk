import type { Coupon } from './coupon';
import type { CouponCode } from './coupon_code';
import type { Graph } from '../../core';
import type { Item } from './item';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface CouponDetail extends Graph {
  curie: 'fx:coupon_detail';

  links: {
    /** This resource. */
    'self': CouponDetail;
    /** Item the coupon was applied to. */
    'fx:item': Item;
    /** Store the coupon belongs to. */
    'fx:store': Store;
    /** Coupon this detail describes. */
    'fx:coupon': Coupon;
    /** Coupon code used in the coupon. */
    'fx:coupon_code': CouponCode;
    /** Transaction the coupon was applied to. */
    'fx:transaction': Transaction;
  };

  props: {
    /** The ID of this coupon detail. */
    id: string;
    /** The original coupon name used for this discount. */
    name: string;
    /** The original coupon code used for this discount. */
    code: string;
    /** The amount of discount applied to this item. */
    amount_per: number;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
