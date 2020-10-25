import type * as FxSubscriptions from "../integration/subscriptions";
import type * as FxSubscription from "./subscription";

export interface Graph {
  curie: FxSubscriptions.Graph["curie"];
  links: never;
  props: never;
  child: FxSubscription.Graph;
}
