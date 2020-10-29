import type { FxTransaction } from './transaction';

export interface FxLastTransaction {
  curie: 'fx:last_transaction';
  links: FxTransaction['links'];
  props: FxTransaction['props'];
  zooms: FxTransaction['zooms'];
}
