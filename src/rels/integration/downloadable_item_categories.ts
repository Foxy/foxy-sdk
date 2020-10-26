import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxItemCategory } from "./item_category";

export interface FxDownloadableItemCategories {
  curie: "fx:downloadable_item_categories";
  links: CollectionLinks<FxDownloadableItemCategories>;
  props: CollectionProps;
  child: FxItemCategory;
}
