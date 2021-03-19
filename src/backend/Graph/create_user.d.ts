import type { Graph } from '../../core';
import type { User } from './user';

export interface CreateUser extends Graph {
  curie: 'fx:create_user';
  links: User['links'];
  props: User['props'];
}
