import type * as Backend from '../../backend';
import type * as Core from '../../core';
import type { Subscription } from './subscription';

export interface Subscriptions extends Core.Graph {
  curie: Backend.Rels.Subscriptions['curie'];
  child: Subscription;
}
