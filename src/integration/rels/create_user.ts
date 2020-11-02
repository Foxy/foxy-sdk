import type { APIGraph } from '../../core/types';
import type { FxUser } from './user';

export interface FxCreateUser extends APIGraph {
  curie: 'fx:create_user';
  links: FxUser['links'];
  props: FxUser['props'];
}
