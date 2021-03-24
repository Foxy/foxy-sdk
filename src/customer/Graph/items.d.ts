import type * as Backend from '../../backend';
import type * as Core from '../../core';
import type { Item } from './item';

export interface Items extends Core.Graph {
  curie: Backend.Rels.Items['curie'];
  child: Item;
}
