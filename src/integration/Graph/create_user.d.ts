import type { User } from './user';
import type { Graph } from '../../core';

export interface CreateUser extends Graph {
  curie: 'fx:create_user';
  links: User['links'];
  props: User['props'];
}
