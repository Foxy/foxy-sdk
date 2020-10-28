import type { FxSubscriptions as IntegrationAPIFxSubscriptions } from "../../integration/rels/subscriptions";
import type { FxSubscription } from "./subscription";

export interface FxSubscriptions {
  curie: IntegrationAPIFxSubscriptions["curie"];
  links: never;
  props: never;
  child: FxSubscription;
}
