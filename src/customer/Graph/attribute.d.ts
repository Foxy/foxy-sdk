import type * as Core from '../../core';
import type * as Integration from '../../integration';

export interface Attribute extends Core.Graph {
  curie: Integration.Rels.Attribute['curie'];
  props: Integration.Rels.Attribute['props'];
}
