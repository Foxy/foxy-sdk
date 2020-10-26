import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxItemOption } from "./item_option";

export interface FxItemOptions {
  curie: "fx:item_options";
  links: CollectionLinks<FxItemOptions>;
  props: CollectionProps;
  child: FxItemOption;
}
