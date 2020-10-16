import type * as FxTransaction from "./transaction";
import type * as FxCouponCode from "./coupon_code";
import type * as FxCoupon from "./coupon";
import type * as FxStore from "./store";
import type * as FxItem from "./item";

export type Rel = "coupon_detail";
export type Curie = "fx:coupon_detail";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Item the coupon was applied to. */
  "fx:item": FxItem.Links;
  /** Store the coupon belongs to. */
  "fx:store": FxStore.Links;
  /** Coupon this detail describes. */
  "fx:coupon": FxCoupon.Links;
  /** Coupon code used in the coupon. */
  "fx:coupon_code": FxCouponCode.Links;
  /** Transaction the coupon was applied to. */
  "fx:transaction": FxTransaction.Links;
}

export interface Props {
  /** The ID of this coupon detail. */
  id: string;
  /** The original coupon name used for this discount. */
  name: string;
  /** The original coupon code used for this discount. */
  code: string;
  /** The amount of discount applied to this item. */
  amount_per: number;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
