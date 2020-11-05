import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxStoreVersion } from './store_version';
import type { Graph } from '../../core';

export interface FxStoreVersions extends Graph {
  curie: 'fx:store_versions';
  links: CollectionGraphLinks<FxStoreVersions>;
  props: CollectionGraphProps;
  child: FxStoreVersion;
}
