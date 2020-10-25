import * as FxCart from "./cart";

export type Rel = "transaction_template";
export type Curie = "fx:transaction_template";
export type Methods = FxCart.Methods;
export type Links = FxCart.Graph;
export type Props = FxCart.Props;
export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
