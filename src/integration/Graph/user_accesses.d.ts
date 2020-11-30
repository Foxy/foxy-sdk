import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { UserAccess } from './user_access';
import type { Graph } from '../../core';

export interface UserAccesses extends Graph {
  curie: 'fx:user_accesses';
  links: CollectionGraphLinks<UserAccesses>;
  props: CollectionGraphProps;
  child: UserAccess;
}
