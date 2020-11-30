import type * as Core from '../../core';
import type * as Integration from '../../integration';
import { Transaction } from './transaction';

export interface Transactions extends Core.Graph {
  curie: Integration.Rels.Transactions['curie'];
  child: Transaction;
}
