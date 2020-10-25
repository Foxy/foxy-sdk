import type * as FxTransaction from "./transaction";

export type Rel = "last_transaction";
export type Curie = "fx:last_transaction";
export type Methods = FxTransaction.Methods;
export type Links = FxTransaction.Graph;
export type Props = FxTransaction.Props;
export type Zooms = FxTransaction.Zooms;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
