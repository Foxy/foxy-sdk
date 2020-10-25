import type * as FxTransaction from "./transaction";

type Curie = "fx:original_transaction";
type Links = FxTransaction.Graph;
type Props = FxTransaction.Graph["props"];
type Zooms = FxTransaction.Graph["zooms"];

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
