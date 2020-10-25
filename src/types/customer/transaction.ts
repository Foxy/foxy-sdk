import type * as IntegrationAPIFxTransaction from "../integration/transaction";
import type { FxItems } from "./items";

export interface FxTransaction {
  curie: IntegrationAPIFxTransaction.Graph["curie"];
  links: Pick<IntegrationAPIFxTransaction.Graph["links"], "fx:receipt">;
  props: IntegrationAPIFxTransaction.Graph["props"];
  zooms: { items?: FxItems };
}
