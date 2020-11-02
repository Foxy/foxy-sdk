import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxTransactionLogDetail } from './transaction_log_detail';

export interface FxTransactionLogDetails extends APIGraph {
  curie: 'fx:transaction_log_details';
  links: APICollectionGraphLinks<FxTransactionLogDetails>;
  props: APICollectionGraphProps;
  child: FxTransactionLogDetail;
}
