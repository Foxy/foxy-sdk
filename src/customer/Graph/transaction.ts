import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { FxItems } from './items';

export interface FxTransaction extends Core.Graph {
  curie: Integration.Rels.FxTransaction['curie'];
  links: Pick<Integration.Rels.FxTransaction['links'], 'fx:receipt'>;
  props: Integration.Rels.FxTransaction['props'];
  zooms: { items?: FxItems };
}
