import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { UserAccess } from './user_access';

export interface UserAccesses extends Graph {
  curie: 'fx:user_accesses';
  links: CollectionGraphLinks<UserAccesses>;
  props: CollectionGraphProps;
  child: UserAccess;
}
