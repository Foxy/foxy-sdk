import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxUser } from './user';
import type { Graph } from '../../core';

export interface FxUsers extends Graph {
  curie: 'fx:users';
  links: CollectionGraphLinks<FxUsers>;
  props: CollectionGraphProps;
  child: FxUser;
}
