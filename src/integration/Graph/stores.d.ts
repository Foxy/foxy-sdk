import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxStore } from './store';
import type { Graph } from '../../core';

export interface FxStores extends Graph {
  curie: 'fx:stores';
  links: CollectionGraphLinks<FxStores>;
  props: CollectionGraphProps;
  child: FxStore;
}
