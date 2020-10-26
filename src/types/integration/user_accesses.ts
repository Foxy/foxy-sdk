import type { CollectionLinks, CollectionProps } from "../index";
import type { FxUserAccess } from "./user_access";

export interface FxUserAccesses {
  curie: "fx:user_accesses";
  links: CollectionLinks<FxUserAccesses>;
  props: CollectionProps;
  child: FxUserAccess;
}
