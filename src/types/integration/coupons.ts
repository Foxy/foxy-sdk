import type { CollectionLinks, CollectionProps } from "../index";
import type { FxCoupon } from "./coupon";

export interface FxCoupons {
  curie: "fx:coupons";
  links: CollectionLinks<FxCoupons>;
  props: CollectionProps;
  child: FxCoupon;
}
