import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Store } from './store';

export interface Stores extends Graph {
  curie: 'fx:stores';
  links: CollectionGraphLinks<Stores>;
  props: CollectionGraphProps;
  child: Store;
}
