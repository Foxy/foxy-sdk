import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxTaxItemCategory } from "./tax_item_category";

export interface FxTaxItemCategories {
  curie: "fx:tax_item_categories";
  links: CollectionLinks<FxTaxItemCategories>;
  props: CollectionProps;
  child: FxTaxItemCategory;
}
