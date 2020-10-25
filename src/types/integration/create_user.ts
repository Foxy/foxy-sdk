import type * as FxUser from "./user";

type Curie = "fx:create_user";
type Links = FxUser.Graph;
type Props = FxUser.Graph["props"];

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
