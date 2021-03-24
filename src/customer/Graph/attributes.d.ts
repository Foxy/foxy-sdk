import type * as Backend from '../../backend';
import type * as Core from '../../core';
import type { Attribute } from './attribute';

export interface Attributes extends Core.Graph {
  curie: Backend.Rels.Attributes['curie'];
  child: Attribute;
}
