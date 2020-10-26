import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxCart } from "./cart";

export interface FxCarts {
  curie: "fx:carts";
  links: CollectionLinks<FxCarts>;
  props: CollectionProps;
  child: FxCart;
}
