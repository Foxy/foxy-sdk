import type * as Backend from '../../backend';
import type * as Core from '../../core';
import type { Items } from './items';

export interface Transaction extends Core.Graph {
  curie: Backend.Rels.Transaction['curie'];
  links: Pick<Backend.Rels.Transaction['links'], 'fx:receipt'>;
  props: Backend.Rels.Transaction['props'];
  zooms: { items?: Items };
}
