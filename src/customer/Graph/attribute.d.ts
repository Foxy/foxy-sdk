import type * as Backend from '../../backend';
import type * as Core from '../../core';

export interface Attribute extends Core.Graph {
  curie: Backend.Rels.Attribute['curie'];
  props: Backend.Rels.Attribute['props'];
}
