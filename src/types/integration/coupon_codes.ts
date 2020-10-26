import type { CollectionLinks, CollectionProps } from "../index";
import type { FxCouponCode } from "./coupon_code";

export interface FxCouponCodes {
  curie: "fx:coupon_codes";
  links: CollectionLinks<FxCouponCodes>;
  props: CollectionProps;
  child: FxCouponCode;
}
