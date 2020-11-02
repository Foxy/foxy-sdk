import type { APIGraph } from '../../core/types';
import type { FxSubscription } from './subscription';
import type { FxSubscriptions as IntegrationAPIFxSubscriptions } from '../../integration/rels/subscriptions';

export interface FxSubscriptions extends APIGraph {
  curie: IntegrationAPIFxSubscriptions['curie'];
  child: FxSubscription;
}
