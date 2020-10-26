import type { CollectionLinks, CollectionProps } from "../index";
import type { FxAppliedTax } from "./applied_tax";

export interface FxAppliedTaxes {
  curie: "fx:applied_taxes";
  links: CollectionLinks<FxAppliedTaxes>;
  props: CollectionProps;
  child: FxAppliedTax;
}
