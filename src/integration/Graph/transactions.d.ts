import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Transaction } from './transaction';
import type { Graph } from '../../core';

export interface Transactions extends Graph {
  curie: 'fx:transactions';
  links: CollectionGraphLinks<Transactions>;
  props: CollectionGraphProps;
  child: Transaction;
}
