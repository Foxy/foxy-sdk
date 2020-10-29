import type { FxTransaction } from './transaction';

export interface FxOriginalTransaction {
  curie: 'fx:original_transaction';
  links: FxTransaction['links'];
  props: FxTransaction['props'];
  zooms: FxTransaction['zooms'];
}
