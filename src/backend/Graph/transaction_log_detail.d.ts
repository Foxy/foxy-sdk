import type { Graph } from '../../core';
import type { Store } from './store';
import type { TransactionLog } from './transaction_log';

export interface TransactionLogDetail extends Graph {
  curie: 'fx:transaction_log_detail';

  links: {
    /** This resource. */
    'self': TransactionLogDetail;
    /** Relared store resource. */
    'fx:store': Store;
    /** Related transaction log resource. */
    'fx:transaction_log': TransactionLog;
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
