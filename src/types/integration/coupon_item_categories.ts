import type { CollectionLinks, CollectionProps } from "../index";
import type { FxCouponItemCategory } from "./coupon_item_category";

export interface FxCouponItemCategories {
  curie: "fx:coupon_item_categories";
  links: CollectionLinks<FxCouponItemCategories>;
  props: CollectionProps;
  child: FxCouponItemCategory;
}
