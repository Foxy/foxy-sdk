import type { Customer } from './customer';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { Transaction } from './transaction';
import type { TransactionLogDetails } from './transaction_log_details';
import type { User } from './user';

export interface TransactionLog extends Graph {
  curie: 'fx:transaction_logs';

  links: {
    /** This resource. */
    'self': TransactionLog;
    /** Related user resource. */
    'fx:user': User;
    /** Relared store resource. */
    'fx:store': Store;
    /** Related customer resource. */
    'fx:customer': Customer;
    /** Related transaction resource. */
    'fx:transaction': Transaction;
    /** List of detailed entries for this log. */
    'fx:transaction_log_details': TransactionLogDetails;
  };

  props: {
    /** A complete JSON snapshot of the transaction prior to the modification made this log entry records. It includes all of the following zoom values: `customer`, `payments`, `applied_taxes`, `discounts`, `shipments`, `billing_addresses`, `items`, `items:item_options`, `custom_fields`, `attributes`. */
    snapshot: string;
    /** Describes the source transaction modification such as admin or hAPI. */
    request_source: string;
    /** The date this resource was created. */
    date_created: string | null;
  };
}
