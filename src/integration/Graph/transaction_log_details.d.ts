import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxTransactionLogDetail } from './transaction_log_detail';
import type { Graph } from '../../core';

export interface FxTransactionLogDetails extends Graph {
  curie: 'fx:transaction_log_details';
  links: CollectionGraphLinks<FxTransactionLogDetails>;
  props: CollectionGraphProps;
  child: FxTransactionLogDetail;
}
