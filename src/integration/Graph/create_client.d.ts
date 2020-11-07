import type { FxClient } from './client';
import type { Graph } from '../../core';

export interface FxCreateClient extends Graph {
  curie: 'fx:create_client';
  links: FxClient['links'];
  props: FxClient['props'];
}
