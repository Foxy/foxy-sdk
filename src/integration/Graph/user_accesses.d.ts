import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxUserAccess } from './user_access';
import type { Graph } from '../../core';

export interface FxUserAccesses extends Graph {
  curie: 'fx:user_accesses';
  links: CollectionGraphLinks<FxUserAccesses>;
  props: CollectionGraphProps;
  child: FxUserAccess;
}
