import type { CollectionLinks, CollectionProps } from "../index";
import type { FxItemCategory } from "./item_category";

export interface FxItemCategories {
  curie: "fx:item_categories";
  links: CollectionLinks<FxItemCategories>;
  props: CollectionProps;
  child: FxItemCategory;
}
