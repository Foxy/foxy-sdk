import type * as FxCouponCode from "./coupon_code";
import type * as FxCoupon from "./coupon";
import type * as FxStore from "./store";
import type * as FxCart from "./cart";

type Curie = "fx:applied_coupon_code";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Related cart resource. */
  "fx:cart": FxCart.Graph;
  /** Related store resource. */
  "fx:store": FxStore.Graph;
  /** Related coupon resource. */
  "fx:coupon": FxCoupon.Graph;
  /** Related coupon code resource. */
  "fx:coupon_code": FxCouponCode.Graph;
}

interface Props {
  /** The coupon code applied to this cart. */
  code: string;
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
