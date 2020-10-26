import type { CollectionLinks, CollectionProps } from "../index";
import type { FxTemplateSet } from "./template_set";

export interface FxTemplateSets {
  curie: "fx:template_sets";
  links: CollectionLinks<FxTemplateSets>;
  props: CollectionProps;
  child: FxTemplateSet;
}
