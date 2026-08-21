import type { Graph } from '../../core';
import type { Transaction } from './transaction';

export interface LastTransaction extends Graph {
  curie: 'fx:last_transaction';
  links: Transaction['links'];
  props: Transaction['props'];
  zooms: Transaction['zooms'];
}
