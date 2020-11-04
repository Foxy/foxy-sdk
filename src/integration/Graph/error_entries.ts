import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxErrorEntry } from './error_entry';
import type { Graph } from '../../core';

export interface FxErrorEntries extends Graph {
  curie: 'fx:error_entries';
  links: CollectionGraphLinks<FxErrorEntries>;
  props: CollectionGraphProps;
  child: FxErrorEntry;
}
