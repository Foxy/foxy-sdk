import type { FxTransaction } from './transaction';
import type { FxCouponCode } from './coupon_code';
import type { FxCoupon } from './coupon';
import type { FxStore } from './store';

export interface FxCouponCodeTransaction {
  curie: 'fx:coupon_code_transaction';

  links: {
    /** This resource. */
    'self': FxCouponCodeTransaction;
    /** Store this transaction was processed by. */
    'fx:store': FxStore;
    /** Coupon that was used with this transaction. */
    'fx:coupon': FxCoupon;
    /** Coupon code that was used with this transaction. */
    'fx:coupon_code': FxCouponCode;
    /** Transaction the coupon code was used with. */
    'fx:transaction': FxTransaction;
  };

  props: {
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
