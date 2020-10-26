import type { CollectionLinks, CollectionProps } from "../index";
import type { FxUser } from "./user";

export interface FxUsers {
  curie: "fx:users";
  links: CollectionLinks<FxUsers>;
  props: CollectionProps;
  child: FxUser;
}
