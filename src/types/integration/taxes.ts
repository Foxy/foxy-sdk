import type { CollectionLinks, CollectionProps } from "../index";
import type { FxTax } from "./tax";

export interface FxTaxes {
  curie: "fx:taxes";
  links: CollectionLinks<FxTaxes>;
  props: CollectionProps;
  child: FxTax;
}
