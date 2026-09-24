import type { Transaction } from './transaction';

export interface LastTransaction extends Omit<Transaction, 'curie'> {
  curie: 'fx:last_transaction';
  links: Transaction['links'] & { self: LastTransaction };
}
