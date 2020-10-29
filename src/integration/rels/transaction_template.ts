import type { FxCart } from './cart';

export interface FxTransactionTemplate {
  curie: 'fx:transaction_template';
  links: FxCart['links'];
  props: FxCart['props'];
  zooms: FxCart['zooms'];
}
