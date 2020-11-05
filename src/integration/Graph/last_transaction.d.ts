import type { FxTransaction } from './transaction';
import type { Graph } from '../../core';

export interface FxLastTransaction extends Graph {
  curie: 'fx:last_transaction';
  links: FxTransaction['links'];
  props: FxTransaction['props'];
  zooms: FxTransaction['zooms'];
}
