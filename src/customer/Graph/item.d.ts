import type * as Backend from '../../backend';
import type * as Core from '../../core';

export interface Item extends Core.Graph {
  curie: Backend.Rels.Item['curie'];
  props: Backend.Rels.Item['props'];
}
