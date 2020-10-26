import type { CollectionLinks, CollectionProps } from "../index";
import type { FxAttribute } from "./attribute";

export interface FxAttributes {
  curie: "fx:attributes";
  links: CollectionLinks<FxAttributes>;
  props: CollectionProps;
  child: FxAttribute;
}
