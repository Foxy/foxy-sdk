import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { User } from './user';

export interface Users extends Graph {
  curie: 'fx:users';
  links: CollectionGraphLinks<Users>;
  props: CollectionGraphProps;
  child: User;
}
