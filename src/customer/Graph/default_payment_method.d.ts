import type * as Backend from '../../backend';
import type * as Core from '../../core';

export interface DefaultPaymentMethod extends Core.Graph {
  curie: Backend.Rels.DefaultPaymentMethod['curie'];
  props: Backend.Rels.DefaultPaymentMethod['props'];
}
