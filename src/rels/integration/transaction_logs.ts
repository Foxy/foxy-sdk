import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxTransactionLog } from "./transaction_log";

export interface FxTransactionLogs {
  curie: "fx:transaction_logs";
  links: CollectionLinks<FxTransactionLogs>;
  props: CollectionProps;
  child: FxTransactionLog;
}
