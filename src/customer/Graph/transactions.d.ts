import type * as Backend from '../../backend';
import type * as Core from '../../core';
import { Transaction } from './transaction';

export interface Transactions extends Core.Graph {
  curie: Backend.Rels.Transactions['curie'];
  child: Transaction;
}
