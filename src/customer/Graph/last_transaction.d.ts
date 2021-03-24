import type { Transaction } from './transaction';

export interface LastTransaction extends Transaction {
  curie: 'fx:last_transaction';
  links: Transaction['links'] & { self: LastTransaction };
}
