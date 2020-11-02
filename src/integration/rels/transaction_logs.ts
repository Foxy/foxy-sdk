import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxTransactionLog } from './transaction_log';

export interface FxTransactionLogs extends APIGraph {
  curie: 'fx:transaction_logs';
  links: APICollectionGraphLinks<FxTransactionLogs>;
  props: APICollectionGraphProps;
  child: FxTransactionLog;
}
