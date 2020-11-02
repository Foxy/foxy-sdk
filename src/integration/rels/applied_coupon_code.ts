import type { APIGraph } from '../../core/types';
import type { FxCart } from './cart';
import type { FxCoupon } from './coupon';
import type { FxCouponCode } from './coupon_code';
import type { FxStore } from './store';

export interface FxAppliedCouponCode extends APIGraph {
  curie: 'fx:applied_coupon_code';

  links: {
    /** This resource. */
    'self': FxAppliedCouponCode;
    /** Related cart resource. */
    'fx:cart': FxCart;
    /** Related store resource. */
    'fx:store': FxStore;
    /** Related coupon resource. */
    'fx:coupon': FxCoupon;
    /** Related coupon code resource. */
    'fx:coupon_code': FxCouponCode;
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
