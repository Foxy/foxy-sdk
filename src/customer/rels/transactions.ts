import type { APIGraph } from '../../core/types';
import type { FxTransaction } from './transaction';
import type { FxTransactions as IntegrationAPIFxTransactions } from '../../integration/rels/transactions';

export interface FxTransactions extends APIGraph {
  curie: IntegrationAPIFxTransactions['curie'];
  child: FxTransaction;
}
