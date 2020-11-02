import type { APIGraph } from '../../core/types';
import type { FxClient } from './client';

export interface FxCreateClient extends APIGraph {
  curie: 'fx:create_client';
  links: FxClient['links'];
  props: FxClient['props'];
}
