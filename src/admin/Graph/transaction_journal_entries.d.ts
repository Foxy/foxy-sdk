import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { TransactionJournalEntry } from './transaction_journal_entry';
import type { Graph } from '../../core';

export interface TransactionJournalEntries extends Graph {
  curie: 'fx:transaction_journal_entries';
  links: CollectionGraphLinks<TransactionJournalEntries>;
  props: CollectionGraphProps;
  child: TransactionJournalEntry;
}
