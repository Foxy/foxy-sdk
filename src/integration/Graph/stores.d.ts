import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Store } from './store';
import type { Graph } from '../../core';

export interface Stores extends Graph {
  curie: 'fx:stores';
  links: CollectionGraphLinks<Stores>;
  props: CollectionGraphProps;
  child: Store;
}
