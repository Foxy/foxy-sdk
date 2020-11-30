import type * as Core from '../../core';
import type * as Integration from '../../integration';

export interface DefaultShippingAddress extends Core.Graph {
  curie: Integration.Rels.DefaultShippingAddress['curie'];
  props: Integration.Rels.DefaultShippingAddress['props'];
}
