import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxSubscription } from './subscription';

export interface FxSubscriptions extends APIGraph {
  curie: 'fx:subscriptions';
  links: APICollectionGraphLinks<FxSubscriptions>;
  props: APICollectionGraphProps;
  child: FxSubscription;
}
