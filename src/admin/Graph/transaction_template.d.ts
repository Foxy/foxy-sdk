import type { Cart } from './cart';
import type { Graph } from '../../core';

export interface TransactionTemplate extends Graph {
  curie: 'fx:transaction_template';
  links: Cart['links'];
  props: Cart['props'];
  zooms: Cart['zooms'];
}
