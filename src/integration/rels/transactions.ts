import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxTransaction } from "./transaction";

export interface FxTransactions {
  curie: "fx:transactions";
  links: CollectionLinks<FxTransactions>;
  props: CollectionProps;
  child: FxTransaction;
}
