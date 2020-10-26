import type { FxSubscriptions as IntegrationAPIFxSubscriptions } from "../integration/subscriptions";
import type { FxSubscription } from "./subscription";

export interface FxSubscriptions {
  curie: IntegrationAPIFxSubscriptions["curie"];
  links: never;
  props: never;
  child: FxSubscription;
}
