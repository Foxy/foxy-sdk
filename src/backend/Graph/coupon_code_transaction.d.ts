import type { Coupon } from './coupon';
import type { CouponCode } from './coupon_code';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface CouponCodeTransaction extends Graph {
  curie: 'fx:coupon_code_transaction';

  links: {
    /** This resource. */
    'self': CouponCodeTransaction;
    /** Store this transaction was processed by. */
    'fx:store': Store;
    /** Coupon that was used with this transaction. */
    'fx:coupon': Coupon;
    /** Coupon code that was used with this transaction. */
    'fx:coupon_code': CouponCode;
    /** Transaction the coupon code was used with. */
    'fx:transaction': Transaction;
  };

  props: {
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
