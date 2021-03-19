import type * as Backend from '../../backend';
import type * as Core from '../../core';
import type { Items } from './items';

export interface TransactionTemplate extends Core.Graph {
  curie: Backend.Rels.TransactionTemplate['curie'];
  props: Backend.Rels.TransactionTemplate['props'];
  zooms: {
    items: Items;
  };
}
