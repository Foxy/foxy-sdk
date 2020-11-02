import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxStoreVersion } from './store_version';

export interface FxStoreVersions extends APIGraph {
  curie: 'fx:store_versions';
  links: APICollectionGraphLinks<FxStoreVersions>;
  props: APICollectionGraphProps;
  child: FxStoreVersion;
}
