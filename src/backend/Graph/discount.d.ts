import type { Coupon } from './coupon';
import type { CouponCode } from './coupon_code';
import type { Customer } from './customer';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface Discount extends Graph {
  curie: 'fx:discount';

  links: {
    /** This resource. */
    'self': Discount;
    /** Store that provided this discount. */
    'fx:store': Store;
    /** Coupon that was used to get this discount. */
    'fx:coupon': Coupon;
    /** Customer who used this discount. */
    'fx:customer': Customer;
    /** Transaction this discount was applied to. */
    'fx:transaction': Transaction;
    /** Coupon code that was used to get this discount. */
    'fx:coupon_code': CouponCode;
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
