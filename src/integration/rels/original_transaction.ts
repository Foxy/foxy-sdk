import type { APIGraph } from '../../core/types';
import type { FxTransaction } from './transaction';

export interface FxOriginalTransaction extends APIGraph {
  curie: 'fx:original_transaction';
  links: FxTransaction['links'];
  props: FxTransaction['props'];
  zooms: FxTransaction['zooms'];
}
