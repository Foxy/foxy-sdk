import type { APIGraph } from '../../core/types';
import type { FxCoupon } from './coupon';
import type { FxCouponCode } from './coupon_code';
import type { FxCustomer } from './customer';
import type { FxStore } from './store';
import type { FxTransaction } from './transaction';

export interface FxDiscount extends APIGraph {
  curie: 'fx:discount';

  links: {
    /** This resource. */
    'self': FxDiscount;
    /** Store that provided this discount. */
    'fx:store': FxStore;
    /** Coupon that was used to get this discount. */
    'fx:coupon': FxCoupon;
    /** Customer who used this discount. */
    'fx:customer': FxCustomer;
    /** Transaction this discount was applied to. */
    'fx:transaction': FxTransaction;
    /** Coupon code that was used to get this discount. */
    'fx:coupon_code': FxCouponCode;
  };

  props: {
    /** The original coupon code used for this discount. */
    code: string;
    /** The amount of the discount. */
    amount: number;
    /** The original coupon name used for this discount. */
    name: string;
    /** The discount displayed in the format of the currency the transaction took place in. */
    display: number;
    /** Whether or not this discount was taxable. */
    is_taxable: boolean;
    /** Whether or not this discount is part of a subscription that is to be charged in the future based on when this transaction was processed. */
    is_future_discount: boolean;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
