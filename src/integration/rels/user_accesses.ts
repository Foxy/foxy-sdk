import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxUserAccess } from './user_access';

export interface FxUserAccesses extends APIGraph {
  curie: 'fx:user_accesses';
  links: APICollectionGraphLinks<FxUserAccesses>;
  props: APICollectionGraphProps;
  child: FxUserAccess;
}
