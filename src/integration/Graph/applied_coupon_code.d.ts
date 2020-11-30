import type { Cart } from './cart';
import type { Coupon } from './coupon';
import type { CouponCode } from './coupon_code';
import type { Store } from './store';
import type { Graph } from '../../core';

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
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
