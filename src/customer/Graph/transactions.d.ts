import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Transaction } from './transaction';

export interface Transactions extends Graph {
  curie: 'fx:transactions';
  links: CollectionGraphLinks<Transactions>;
  props: CollectionGraphProps;
  child: Transaction;
}
