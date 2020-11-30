import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { Attribute } from './attribute';

export interface Attributes extends Core.Graph {
  curie: Integration.Rels.Attributes['curie'];
  child: Attribute;
}
