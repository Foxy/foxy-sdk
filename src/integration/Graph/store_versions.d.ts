import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { StoreVersion } from './store_version';
import type { Graph } from '../../core';

export interface StoreVersions extends Graph {
  curie: 'fx:store_versions';
  links: CollectionGraphLinks<StoreVersions>;
  props: CollectionGraphProps;
  child: StoreVersion;
}
