import type * as FxCouponCodeTransactions from "./coupon_code_transactions";
import type * as FxCoupon from "./coupon";
import type * as FxStore from "./store";

export type Rel = "coupon_code";
export type Curie = "fx:coupon_code";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Store this coupon code belongs to. */
  "fx:store": FxStore.Graph;
  /** Coupon this code corresponds to. */
  "fx:coupon": FxCoupon.Graph;
  /** Transactions using this coupon code. */
  "fx:coupon_code_transactions": FxCouponCodeTransactions.Graph;
}

export interface Props {
  /** The string value of this coupon code which your customer will add to their cart to use this coupon. */
  code: string;
  /** For informational purposes, this shows you how many times this coupon code has already been used. */
  number_of_uses_to_date: number;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
