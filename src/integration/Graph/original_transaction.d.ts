import type { Transaction } from './transaction';
import type { Graph } from '../../core';

export interface OriginalTransaction extends Graph {
  curie: 'fx:original_transaction';
  links: Transaction['links'];
  props: Transaction['props'];
  zooms: Transaction['zooms'];
}
