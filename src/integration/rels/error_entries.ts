import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxErrorEntry } from './error_entry';

export interface FxErrorEntries {
  curie: 'fx:error_entries';
  links: CollectionLinks<FxErrorEntries>;
  props: CollectionProps;
  child: FxErrorEntry;
}
