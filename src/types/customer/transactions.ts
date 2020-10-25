import type * as IntegrationAPIFxTransactions from "../integration/transactions";
import type { FxTransaction } from "./transaction";

export interface FxTransactions {
  curie: IntegrationAPIFxTransactions.Graph["curie"];
  links: never;
  props: never;
  child: FxTransaction;
}
