import type * as Core from '../../core';
import type * as Integration from '../../integration';

export interface FxAttribute extends Core.Graph {
  curie: Integration.Rels.FxAttribute['curie'];
  props: Integration.Rels.FxAttribute['props'];
}
