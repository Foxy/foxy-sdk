import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { TransactionLogDetail } from './transaction_log_detail';

export interface TransactionLogDetails extends Graph {
  curie: 'fx:transaction_log_details';
  links: CollectionGraphLinks<TransactionLogDetails>;
  props: CollectionGraphProps;
  child: TransactionLogDetail;
}
