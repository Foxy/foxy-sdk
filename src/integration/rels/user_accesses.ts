import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxUserAccess } from './user_access';

export interface FxUserAccesses {
  curie: 'fx:user_accesses';
  links: CollectionLinks<FxUserAccesses>;
  props: CollectionProps;
  child: FxUserAccess;
}
