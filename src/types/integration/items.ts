import type { CollectionLinks, CollectionProps } from "../index";
import type { FxItem } from "./item";

export interface FxItems {
  curie: "fx:items";
  links: CollectionLinks<FxItems>;
  props: CollectionProps;
  child: FxItem;
}
