import type { FxTransaction } from './transaction';
import type { Graph } from '../../core';

export interface FxOriginalTransaction extends Graph {
  curie: 'fx:original_transaction';
  links: FxTransaction['links'];
  props: FxTransaction['props'];
  zooms: FxTransaction['zooms'];
}
