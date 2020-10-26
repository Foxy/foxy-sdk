import type { CollectionLinks, CollectionProps } from "../index";
import type { FxStore } from "./store";

export interface FxStores {
  curie: "fx:stores";
  links: CollectionLinks<FxStores>;
  props: CollectionProps;
  child: FxStore;
}
