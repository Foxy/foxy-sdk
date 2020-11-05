import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { FxItems } from './items';

export interface FxTransactionTemplate extends Core.Graph {
  curie: Integration.Rels.FxTransactionTemplate['curie'];
  props: Integration.Rels.FxTransactionTemplate['props'];
  zooms: {
    items: FxItems;
  };
}
