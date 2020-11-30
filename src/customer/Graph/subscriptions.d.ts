import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { Subscription } from './subscription';

export interface Subscriptions extends Core.Graph {
  curie: Integration.Rels.Subscriptions['curie'];
  child: Subscription;
}
