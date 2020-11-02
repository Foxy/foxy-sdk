import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxErrorEntry } from './error_entry';

export interface FxErrorEntries extends APIGraph {
  curie: 'fx:error_entries';
  links: APICollectionGraphLinks<FxErrorEntries>;
  props: APICollectionGraphProps;
  child: FxErrorEntry;
}
