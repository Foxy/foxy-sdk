import type * as Core from '../../core';
import type * as Integration from '../../integration';

export interface Item extends Core.Graph {
  curie: Integration.Rels.Item['curie'];
  props: Integration.Rels.Item['props'];
}
