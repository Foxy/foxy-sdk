import type { APIGraph } from '../../core/types';
import type { FxStore } from './store';
import type { FxTransactionLog } from './transaction_log';

export interface FxTransactionLogDetail extends APIGraph {
  curie: 'fx:transaction_log_detail';

  links: {
    /** This resource. */
    'self': FxTransactionLogDetail;
    /** Relared store resource. */
    'fx:store': FxStore;
    /** Related transaction log resource. */
    'fx:transaction_log': FxTransactionLog;
  };

  props: {
    /** A text representation of the type of request this log entry is for such as `item_edit`. */
    request_type: string;
    /** A reference id of some kind to help describe which resource this log entry refers to. */
    reference: string;
    /** The details of the changes for this log in JSON format. */
    log: string;
  };
}
