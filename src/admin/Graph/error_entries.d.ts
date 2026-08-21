import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { ErrorEntry } from './error_entry';
import type { Graph } from '../../core';

export interface ErrorEntries extends Graph {
  curie: 'fx:error_entries';
  links: CollectionGraphLinks<ErrorEntries>;
  props: CollectionGraphProps;
  child: ErrorEntry;
}
