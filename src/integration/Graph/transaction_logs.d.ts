import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { TransactionLog } from './transaction_log';
import type { Graph } from '../../core';

export interface TransactionLogs extends Graph {
  curie: 'fx:transaction_logs';
  links: CollectionGraphLinks<TransactionLogs>;
  props: CollectionGraphProps;
  child: TransactionLog;
}
