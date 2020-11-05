import type { FxStore } from './store';
import type { Graph } from '../../core';

export interface FxDefaultStore extends Graph {
  curie: 'fx:default_store';
  links: FxStore['links'];
  props: FxStore['props'];
}
