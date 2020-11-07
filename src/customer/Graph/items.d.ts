import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { FxItem } from './item';

export interface FxItems extends Core.Graph {
  curie: Integration.Rels.FxItems['curie'];
  child: FxItem;
}
