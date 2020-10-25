import type * as FxItem from "../integration/item";

export interface Graph {
  curie: FxItem.Graph["curie"];
  links: never;
  props: FxItem.Graph["props"];
}
