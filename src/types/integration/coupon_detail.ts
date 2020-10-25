import type * as FxTransaction from "./transaction";
import type * as FxCouponCode from "./coupon_code";
import type * as FxCoupon from "./coupon";
import type * as FxStore from "./store";
import type * as FxItem from "./item";

type Curie = "fx:coupon_detail";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Item the coupon was applied to. */
  "fx:item": FxItem.Graph;
  /** Store the coupon belongs to. */
  "fx:store": FxStore.Graph;
  /** Coupon this detail describes. */
  "fx:coupon": FxCoupon.Graph;
  /** Coupon code used in the coupon. */
  "fx:coupon_code": FxCouponCode.Graph;
  /** Transaction the coupon was applied to. */
  "fx:transaction": FxTransaction.Graph;
}

interface Props {
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

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
