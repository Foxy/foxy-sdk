import type * as FxStore from "./store";

export type Rel = "default_store";
export type Curie = "fx:default_store";
export type Methods = FxStore.Methods;
export type Links = FxStore.Graph;
export type Props = FxStore.Props;
export type Zooms = FxStore.Zooms;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
