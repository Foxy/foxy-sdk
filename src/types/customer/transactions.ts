import type * as FxTransactions from "../integration/transactions";
import type * as FxTransaction from "./transaction";

export interface Graph {
  curie: FxTransactions.Graph["curie"];
  links: never;
  props: never;
  child: FxTransaction.Graph;
}
