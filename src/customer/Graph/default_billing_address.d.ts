import type * as Backend from '../../backend';
import type * as Core from '../../core';

export interface DefaultBillingAddress extends Core.Graph {
  curie: Backend.Rels.DefaultBillingAddress['curie'];
  props: Backend.Rels.DefaultBillingAddress['props'];
}
