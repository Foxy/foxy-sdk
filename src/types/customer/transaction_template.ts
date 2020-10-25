import type * as IntegrationAPIFxTransactionTemplate from "../integration/transaction_template";
import type { FxItems } from "./items";

export interface FxTransactionTemplate {
  curie: IntegrationAPIFxTransactionTemplate.Graph["curie"];
  links: never;
  props: IntegrationAPIFxTransactionTemplate.Graph["props"];
  zooms: {
    items: FxItems;
  };
}
