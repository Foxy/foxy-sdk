import type { FxUser } from './user';
import type { Graph } from '../../core';

export interface FxCreateUser extends Graph {
  curie: 'fx:create_user';
  links: FxUser['links'];
  props: FxUser['props'];
}
