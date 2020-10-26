import type { CollectionLinks, CollectionProps } from "../index";
import type { FxItemOption } from "./item_option";

export interface FxItemOptions {
  curie: "fx:item_options";
  links: CollectionLinks<FxItemOptions>;
  props: CollectionProps;
  child: FxItemOption;
}
