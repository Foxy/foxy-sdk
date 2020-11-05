import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { FxSubscription } from './subscription';

export interface FxSubscriptions extends Core.Graph {
  curie: Integration.Rels.FxSubscriptions['curie'];
  child: FxSubscription;
}
