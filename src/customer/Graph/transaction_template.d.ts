import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { Items } from './items';

export interface TransactionTemplate extends Core.Graph {
  curie: Integration.Rels.TransactionTemplate['curie'];
  props: Integration.Rels.TransactionTemplate['props'];
  zooms: {
    items: Items;
  };
}
