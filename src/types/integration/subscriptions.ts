import type { CollectionLinks, CollectionProps } from "../index";
import type { FxSubscription } from "./subscription";

export interface FxSubscriptions {
  curie: "fx:subscriptions";
  links: CollectionLinks<FxSubscriptions>;
  props: CollectionProps;
  child: FxSubscription;
}
