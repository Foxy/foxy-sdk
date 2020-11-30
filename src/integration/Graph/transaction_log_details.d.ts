import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { TransactionLogDetail } from './transaction_log_detail';
import type { Graph } from '../../core';

export interface TransactionLogDetails extends Graph {
  curie: 'fx:transaction_log_details';
  links: CollectionGraphLinks<TransactionLogDetails>;
  props: CollectionGraphProps;
  child: TransactionLogDetail;
}
