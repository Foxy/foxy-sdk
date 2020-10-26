import type { CollectionLinks, CollectionProps } from "../index";
import type { FxCouponDetail } from "./coupon_detail";

export interface FxCouponDetails {
  curie: "fx:coupon_details";
  links: CollectionLinks<FxCouponDetails>;
  props: CollectionProps;
  child: FxCouponDetail;
}
