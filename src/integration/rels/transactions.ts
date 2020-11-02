import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxTransaction } from './transaction';

export interface FxTransactions extends APIGraph {
  curie: 'fx:transactions';
  links: APICollectionGraphLinks<FxTransactions>;
  props: APICollectionGraphProps;
  child: FxTransaction;
}
