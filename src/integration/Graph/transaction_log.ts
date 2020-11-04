import type { FxCustomer } from './customer';
import type { FxStore } from './store';
import type { FxTransaction } from './transaction';
import type { FxTransactionLogDetails } from './transaction_log_details';
import type { FxUser } from './user';
import type { Graph } from '../../core';

export interface FxTransactionLog extends Graph {
  curie: 'fx:transaction_logs';

  links: {
    /** This resource. */
    'self': FxTransactionLog;
    /** Related user resource. */
    'fx:user': FxUser;
    /** Relared store resource. */
    'fx:store': FxStore;
    /** Related customer resource. */
    'fx:customer': FxCustomer;
    /** Related transaction resource. */
    'fx:transaction': FxTransaction;
    /** List of detailed entries for this log. */
    'fx:transaction_log_details': FxTransactionLogDetails;
  };

  props: {
    /** A complete JSON snapshot of the transaction prior to the modification made this log entry records. It includes all of the following zoom values: `customer`, `payments`, `applied_taxes`, `discounts`, `shipments`, `billing_addresses`, `items`, `items:item_options`, `custom_fields`, `attributes`. */
    snapshot: string;
    /** Describes the source transaction modification such as admin or hAPI. */
    request_source: string;
    /** The date this resource was created. */
    date_created: string;
  };
}
