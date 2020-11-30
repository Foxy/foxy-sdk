import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { StoreVersion } from './store_version';

export interface StoreVersions extends Graph {
  curie: 'fx:store_versions';
  links: CollectionGraphLinks<StoreVersions>;
  props: CollectionGraphProps;
  child: StoreVersion;
}
