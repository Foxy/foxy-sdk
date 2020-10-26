import type { CollectionLinks, CollectionProps } from "../index";
import type { FxFraudProtection } from "./fraud_protection";

export interface FxFraudProtections {
  curie: "fx:fraud_protections";
  links: CollectionLinks<FxFraudProtections>;
  props: CollectionProps;
  child: FxFraudProtection;
}
