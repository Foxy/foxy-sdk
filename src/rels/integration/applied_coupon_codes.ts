import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxAppliedCouponCode } from "./applied_coupon_code";

export interface FxAppliedCouponCodes {
  curie: "fx:applied_coupon_codes";
  links: CollectionLinks<FxAppliedCouponCodes>;
  props: CollectionProps;
  child: FxAppliedCouponCode;
}
