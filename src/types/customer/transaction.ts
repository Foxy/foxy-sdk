import type * as FxTransaction from "../integration/transaction";
import type * as FxItems from "./items";

export interface Graph {
  curie: FxTransaction.Graph["curie"];
  links: Pick<FxTransaction.Graph["links"], "fx:receipt">;
  props: FxTransaction.Graph["props"];
  zooms: { items?: FxItems.Graph };
}
