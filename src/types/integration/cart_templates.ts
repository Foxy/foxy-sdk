import type { CollectionLinks, CollectionProps } from "../index";
import type { FxCartTemplate } from "./cart_template";

export interface FxCartTemplates {
  curie: "fx:cart_templates";
  links: CollectionLinks<FxCartTemplates>;
  props: CollectionProps;
  child: FxCartTemplate;
}
