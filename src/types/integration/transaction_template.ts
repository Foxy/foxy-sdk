import * as FxCart from "./cart";

type Curie = "fx:transaction_template";
type Links = FxCart.Graph;
type Props = FxCart.Graph["props"];

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
