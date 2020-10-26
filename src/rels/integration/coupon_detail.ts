import type { FxTransaction } from "./transaction";
import type { FxCouponCode } from "./coupon_code";
import type { FxCoupon } from "./coupon";
import type { FxStore } from "./store";
import type { FxItem } from "./item";

export interface FxCouponDetail {
  curie: "fx:coupon_detail";

  links: {
    /** This resource. */
    "self": FxCouponDetail;
    /** Item the coupon was applied to. */
    "fx:item": FxItem;
    /** Store the coupon belongs to. */
    "fx:store": FxStore;
    /** Coupon this detail describes. */
    "fx:coupon": FxCoupon;
    /** Coupon code used in the coupon. */
    "fx:coupon_code": FxCouponCode;
    /** Transaction the coupon was applied to. */
    "fx:transaction": FxTransaction;
  };

  props: {
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
  };
}
