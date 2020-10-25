import type * as FxUser from "./user";

export type Rel = "create_user";
export type Curie = "fx:create_user";
export type Methods = "POST" | "OPTIONS";
export type Links = FxUser.Graph;
export type Props = FxUser.Props;
export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
