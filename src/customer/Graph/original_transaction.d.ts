import type { Transaction } from './transaction';

export interface OriginalTransaction extends Transaction {
  curie: 'fx:original_transaction';
  links: Transaction['links'] & { self: OriginalTransaction };
}
