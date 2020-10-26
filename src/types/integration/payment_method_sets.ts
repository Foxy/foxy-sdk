import type { CollectionLinks, CollectionProps } from "../index";
import type { FxPaymentMethodSet } from "./payment_method_set";

export interface FxPaymentMethodSets {
  curie: "fx:payment_method_sets";
  links: CollectionLinks<FxPaymentMethodSets>;
  props: CollectionProps;
  child: FxPaymentMethodSet;
}
