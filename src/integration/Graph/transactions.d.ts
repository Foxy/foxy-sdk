import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxTransaction } from './transaction';
import type { Graph } from '../../core';

export interface FxTransactions extends Graph {
  curie: 'fx:transactions';
  links: CollectionGraphLinks<FxTransactions>;
  props: CollectionGraphProps;
  child: FxTransaction;
}
