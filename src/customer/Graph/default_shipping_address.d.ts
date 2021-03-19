import type * as Backend from '../../backend';
import type * as Core from '../../core';

export interface DefaultShippingAddress extends Core.Graph {
  curie: Backend.Rels.DefaultShippingAddress['curie'];
  props: Backend.Rels.DefaultShippingAddress['props'];
}
