import { CollectionLinks, CollectionProps } from "..";
import type { FxDiscountDetail } from "./discount_detail";

export interface FxDiscountDetails {
  curie: "fx:discount_details";
  links: CollectionLinks<FxDiscountDetails>;
  props: CollectionProps;
  child: FxDiscountDetail;
}
