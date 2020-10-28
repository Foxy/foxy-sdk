import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxTransactionLogDetail } from "./transaction_log_detail";

export interface FxTransactionLogDetails {
  curie: "fx:transaction_log_details";
  links: CollectionLinks<FxTransactionLogDetails>;
  props: CollectionProps;
  child: FxTransactionLogDetail;
}
