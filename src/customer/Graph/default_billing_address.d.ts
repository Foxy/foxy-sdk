import type * as Core from '../../core';
import type * as Integration from '../../integration';

export interface DefaultBillingAddress extends Core.Graph {
  curie: Integration.Rels.DefaultBillingAddress['curie'];
  props: Integration.Rels.DefaultBillingAddress['props'];
}
