import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { Item } from './item';

export interface Items extends Core.Graph {
  curie: Integration.Rels.Items['curie'];
  child: Item;
}
