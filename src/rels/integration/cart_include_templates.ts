import { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxCartIncludeTemplate } from "./cart_include_template";

export interface FxCartIncludeTemplates {
  curie: "fx:cart_include_templates";
  links: CollectionLinks<FxCartIncludeTemplates>;
  props: CollectionProps;
  child: FxCartIncludeTemplate;
}
