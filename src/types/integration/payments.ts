import type { CollectionLinks, CollectionProps } from "../index";
import type { FxPayment } from "./payment";

export interface FxPayments {
  curie: "fx:payments";
  links: CollectionLinks<FxPayments>;
  props: CollectionProps;
  child: FxPayment;
}
