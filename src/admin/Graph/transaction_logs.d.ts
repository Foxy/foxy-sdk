import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { TransactionLog } from './transaction_log';

export interface TransactionLogs extends Graph {
  curie: 'fx:transaction_logs';
  links: CollectionGraphLinks<TransactionLogs>;
  props: CollectionGraphProps;
  child: TransactionLog;
}
