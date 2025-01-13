import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { UserInvitation } from './user_invitation';

export interface UserInvitations extends Graph {
  curie: 'fx:user_accesses';
  links: CollectionGraphLinks<UserInvitations>;
  props: CollectionGraphProps;
  child: UserInvitation;
}
