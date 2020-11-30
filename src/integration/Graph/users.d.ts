import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { User } from './user';
import type { Graph } from '../../core';

export interface Users extends Graph {
  curie: 'fx:users';
  links: CollectionGraphLinks<Users>;
  props: CollectionGraphProps;
  child: User;
}
