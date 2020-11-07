import type { FxCart } from './cart';
import type { Graph } from '../../core';

export interface FxTransactionTemplate extends Graph {
  curie: 'fx:transaction_template';
  links: FxCart['links'];
  props: FxCart['props'];
  zooms: FxCart['zooms'];
}
