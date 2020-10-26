import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxDiscount } from "./discount";

export interface FxDiscounts {
  curie: "fx:discounts";
  links: CollectionLinks<FxDiscounts>;
  props: CollectionProps;
  child: FxDiscount;
}
