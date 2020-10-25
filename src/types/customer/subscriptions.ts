import type * as IntegrationAPIFxSubscriptions from "../integration/subscriptions";
import type { FxSubscription } from "./subscription";

export interface FxSubscriptions {
  curie: IntegrationAPIFxSubscriptions.Graph["curie"];
  links: never;
  props: never;
  child: FxSubscription;
}
