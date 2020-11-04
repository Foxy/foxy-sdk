import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxSubscription } from './subscription';
import type { Graph } from '../../core';

export interface FxSubscriptions extends Graph {
  curie: 'fx:subscriptions';
  links: CollectionGraphLinks<FxSubscriptions>;
  props: CollectionGraphProps;
  child: FxSubscription;
}
