import type { FxTransaction as IntegrationAPIFxTransaction } from "../../integration/rels/transaction";
import type { FxItems } from "./items";

export interface FxTransaction {
  curie: IntegrationAPIFxTransaction["curie"];
  links: Pick<IntegrationAPIFxTransaction["links"], "fx:receipt">;
  props: IntegrationAPIFxTransaction["props"];
  zooms: { items?: FxItems };
}
