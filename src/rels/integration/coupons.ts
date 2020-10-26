import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxCoupon } from "./coupon";

export interface FxCoupons {
  curie: "fx:coupons";
  links: CollectionLinks<FxCoupons>;
  props: CollectionProps;
  child: FxCoupon;
}
