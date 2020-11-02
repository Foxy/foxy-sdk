import type { APIGraph } from '../../core/types';
import type { FxStore } from './store';

export interface FxDefaultStore extends APIGraph {
  curie: 'fx:default_store';
  links: FxStore['links'];
  props: FxStore['props'];
}
