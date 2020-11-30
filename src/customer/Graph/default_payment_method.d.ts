import type * as Core from '../../core';
import type * as Integration from '../../integration';

export interface DefaultPaymentMethod extends Core.Graph {
  curie: Integration.Rels.DefaultPaymentMethod['curie'];
  props: Integration.Rels.DefaultPaymentMethod['props'];
}
