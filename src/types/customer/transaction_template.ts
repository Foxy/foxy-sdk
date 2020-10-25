import type * as FxTransactionTemplate from "../integration/transaction_template";
import type * as FxItems from "./items";

export interface Graph {
  curie: FxTransactionTemplate.Graph["curie"];
  links: never;
  props: FxTransactionTemplate.Graph["props"];
  zooms: {
    items: FxItems.Graph;
  };
}
