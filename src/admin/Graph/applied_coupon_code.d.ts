import type { Cart } from './cart';
import type { Coupon } from './coupon';
import type { CouponCode } from './coupon_code';
import type { Graph } from '../../core';
import type { Store } from './store';

export interface AppliedCouponCode extends Graph {
  curie: 'fx:applied_coupon_code';

  links: {
    /** This resource. */
    'self': AppliedCouponCode;
    /** Related cart resource. */
    'fx:cart': Cart;
    /** Related store resource. */
    'fx:store': Store;
    /** Related coupon resource. */
    'fx:coupon': Coupon;
    /** Related coupon code resource. */
    'fx:coupon_code': CouponCode;
  };

  props: {
    /** The coupon code applied to this cart. */
    code: string;
    /** Allow the coupon to be added to the cart, even if it has expired or the number of uses per coupon, code or customer has reached their maximums. This value is available only in POST request body. */
    ignore_usage_limits?: boolean;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
