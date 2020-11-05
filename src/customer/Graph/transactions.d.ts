import type * as Core from '../../core';
import type * as Integration from '../../integration';
import { FxTransaction } from './transaction';

export interface FxTransactions extends Core.Graph {
  curie: Integration.Rels.FxTransactions['curie'];
  child: FxTransaction;
}
