import type { APIGraph } from '../../core/types';
import type { FxCart } from './cart';

export interface FxTransactionTemplate extends APIGraph {
  curie: 'fx:transaction_template';
  links: FxCart['links'];
  props: FxCart['props'];
  zooms: FxCart['zooms'];
}
