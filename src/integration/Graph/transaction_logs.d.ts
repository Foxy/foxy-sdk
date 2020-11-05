import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxTransactionLog } from './transaction_log';
import type { Graph } from '../../core';

export interface FxTransactionLogs extends Graph {
  curie: 'fx:transaction_logs';
  links: CollectionGraphLinks<FxTransactionLogs>;
  props: CollectionGraphProps;
  child: FxTransactionLog;
}
