import type * as FxStore from "./store";

type Curie = "fx:default_store";
type Links = FxStore.Graph;
type Props = FxStore.Graph["props"];
type Zooms = FxStore.Graph["zooms"];

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
