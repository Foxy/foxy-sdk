import type { Transaction } from './transaction';

export interface OriginalTransaction extends Omit<Transaction, 'curie'> {
  curie: 'fx:original_transaction';
  links: Transaction['links'] & { self: OriginalTransaction };
}
