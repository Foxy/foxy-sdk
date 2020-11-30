import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Subscription } from './subscription';
import type { Graph } from '../../core';

export interface Subscriptions extends Graph {
  curie: 'fx:subscriptions';
  links: CollectionGraphLinks<Subscriptions>;
  props: CollectionGraphProps;
  child: Subscription;
}
