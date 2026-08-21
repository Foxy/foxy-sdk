import type { Graph } from '../../core';
import type { Store } from './store';

export interface DefaultStore extends Graph {
  curie: 'fx:default_store';
  links: Store['links'];
  props: Store['props'];
}
