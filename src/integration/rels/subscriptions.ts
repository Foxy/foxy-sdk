import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxSubscription } from "./subscription";

export interface FxSubscriptions {
  curie: "fx:subscriptions";
  links: CollectionLinks<FxSubscriptions>;
  props: CollectionProps;
  child: FxSubscription;
}
