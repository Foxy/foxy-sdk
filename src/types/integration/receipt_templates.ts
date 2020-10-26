import type { CollectionLinks, CollectionProps } from "../index";
import type { FxReceiptTemplate } from "./receipt_template";

export interface FxReceiptTemplates {
  curie: "fx:receipt_templates";
  links: CollectionLinks<FxReceiptTemplates>;
  props: CollectionProps;
  child: FxReceiptTemplate;
}
