import type * as Core from '../../core';
import type * as Integration from '../../integration';

export interface FxItem extends Core.Graph {
  curie: Integration.Rels.FxItem['curie'];
  props: Integration.Rels.FxItem['props'];
}
