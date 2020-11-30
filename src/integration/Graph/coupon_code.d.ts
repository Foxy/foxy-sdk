import type { Coupon } from './coupon';
import type { CouponCodeTransactions } from './coupon_code_transactions';
import type { Graph } from '../../core';
import type { Store } from './store';

export interface CouponCode extends Graph {
  curie: 'fx:coupon_code';

  links: {
    /** This resource. */
    'self': CouponCode;
    /** Store this coupon code belongs to. */
    'fx:store': Store;
    /** Coupon this code corresponds to. */
    'fx:coupon': Coupon;
    /** Transactions using this coupon code. */
    'fx:coupon_code_transactions': CouponCodeTransactions;
  };

  props: {
    /** The string value of this coupon code which your customer will add to their cart to use this coupon. */
    code: string;
    /** For informational purposes, this shows you how many times this coupon code has already been used. */
    number_of_uses_to_date: number;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
