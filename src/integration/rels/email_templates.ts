import { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxEmailTemplate } from "./email_template";

export interface FxEmailTemplates {
  curie: "fx:email_templates";
  links: CollectionLinks<FxEmailTemplates>;
  props: CollectionProps;
  child: FxEmailTemplate;
}
