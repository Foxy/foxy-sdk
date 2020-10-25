import type * as FxClient from "./client";

export type Rel = "create_client";
export type Curie = "fx:create_client";
export type Methods = "POST" | "OPTIONS";
export type Links = FxClient.Graph;
export type Props = FxClient.Props;
export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
