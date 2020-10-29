import type { FxClient } from './client';

export interface FxCreateClient {
  curie: 'fx:create_client';
  links: FxClient['links'];
  props: FxClient['props'];
}
