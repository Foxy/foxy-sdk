import type { FxTransactions as IntegrationAPIFxTransactions } from '../../integration/rels/transactions';
import type { FxTransaction } from './transaction';

export interface FxTransactions {
  curie: IntegrationAPIFxTransactions['curie'];
  links: never;
  props: never;
  child: FxTransaction;
}
