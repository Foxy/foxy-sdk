import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Subscription } from './subscription';

export interface Subscriptions extends Graph {
  curie: 'fx:subscriptions';
  links: CollectionGraphLinks<Subscriptions>;
  props: CollectionGraphProps;
  child: Subscription;
}
