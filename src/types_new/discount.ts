import type * as FxTransaction from "./transaction";
import type * as FxCouponCode from "./coupon_code";
import type * as FxCustomer from "./customer";
import type * as FxCoupon from "./coupon";
import type * as FxStore from "./store";

export type Rel = "discount";
export type Curie = "fx:discount";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Store that provided this discount. */
  "fx:store": FxStore.Links;
  /** Coupon that was used to get this discount. */
  "fx:coupon": FxCoupon.Links;
  /** Customer who used this discount. */
  "fx:customer": FxCustomer.Links;
  /** Transaction this discount was applied to. */
  "fx:transaction": FxTransaction.Links;
  /** Coupon code that was used to get this discount. */
  "fx:coupon_code": FxCouponCode.Links;
}

export interface Props {
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
}

export type Zoom = never;
