import type * as FxItems from "../integration/items";
import type * as FxItem from "./item";

export interface Graph {
  curie: FxItems.Graph["curie"];
  links: never;
  props: never;
  child: FxItem.Graph;
}
