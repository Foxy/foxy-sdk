import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { FxAttribute } from './attribute';

export interface FxAttributes extends Core.Graph {
  curie: Integration.Rels.FxAttributes['curie'];
  child: FxAttribute;
}
