import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { Items } from './items';

export interface Transaction extends Core.Graph {
  curie: Integration.Rels.Transaction['curie'];
  links: Pick<Integration.Rels.Transaction['links'], 'fx:receipt'>;
  props: Integration.Rels.Transaction['props'];
  zooms: { items?: Items };
}
