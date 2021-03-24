import type { Client } from './client';
import type { Graph } from '../../core';

export interface CreateClient extends Graph {
  curie: 'fx:create_client';
  links: Client['links'];
  props: Client['props'];
}
