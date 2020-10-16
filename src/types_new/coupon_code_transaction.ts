import type * as FxTransaction from "./transaction";
import type * as FxCouponCode from "./coupon_code";
import type * as FxCoupon from "./coupon";
import type * as FxStore from "./store";

export type Rel = "coupon_code_transaction";
export type Curie = "fx:coupon_code_transaction";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Store this transaction was processed by. */
  "fx:store": FxStore.Links;
  /** Coupon that was used with this transaction. */
  "fx:coupon": FxCoupon.Links;
  /** Coupon code that was used with this transaction. */
  "fx:coupon_code": FxCouponCode.Links;
  /** Transaction the coupon code was used with. */
  "fx:transaction": FxTransaction.Links;
}

export interface Props {
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
