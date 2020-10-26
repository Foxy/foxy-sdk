import { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxDiscountDetail } from "./discount_detail";

export interface FxDiscountDetails {
  curie: "fx:discount_details";
  links: CollectionLinks<FxDiscountDetails>;
  props: CollectionProps;
  child: FxDiscountDetail;
}
