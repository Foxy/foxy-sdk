import type { TransactionLog } from './transaction_log';
import type { Transaction } from './transaction';
import type { Graph } from '../../core';
import type { Store } from './store';

export interface TransactionJournalEntry extends Graph {
  curie: 'fx:transaction_journal_entry';

  links: {
    /** This resource. */
    'self': TransactionJournalEntry;
    /** Relared store resource. */
    'fx:store': Store;
    /** Related transaction resource. */
    'fx:transaction': Transaction;
    /** Related transaction log. */
    'fx:transaction_log': TransactionLog;
  };

  props: {
    /** The value of money that should be transferred to or from the merchant's bank account (or comparable). Note that voids or refunds will result in a negative number. */
    amount: number;
    /** If custom transaction IDs, prefixes, or suffixes have been configured, this value will contain the custom ID (which may be a string). Otherwise it will be identical to the id value (an integer). */
    display_id: string | number;
    /** The date this resource was created. */
    date_created: string | null;
  };

  zooms: {
    transaction_logs?: TransactionLog;
  };
}
