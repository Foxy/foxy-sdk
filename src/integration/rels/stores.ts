import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxStore } from './store';

export interface FxStores extends APIGraph {
  curie: 'fx:stores';
  links: APICollectionGraphLinks<FxStores>;
  props: APICollectionGraphProps;
  child: FxStore;
}
