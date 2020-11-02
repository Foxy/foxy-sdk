import type { APIGraph } from '../../core/types';
import type { FxTransaction } from './transaction';

export interface FxLastTransaction extends APIGraph {
  curie: 'fx:last_transaction';
  links: FxTransaction['links'];
  props: FxTransaction['props'];
  zooms: FxTransaction['zooms'];
}
