import type { Store } from './store';
import type { Graph } from '../../core';

export interface DefaultStore extends Graph {
  curie: 'fx:default_store';
  links: Store['links'];
  props: Store['props'];
}
