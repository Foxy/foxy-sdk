import type * as FxClient from "./client";

type Curie = "fx:create_client";
type Links = FxClient.Graph;
type Props = FxClient.Graph["props"];

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
