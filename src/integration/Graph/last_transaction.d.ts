import type { Transaction } from './transaction';
import type { Graph } from '../../core';

export interface LastTransaction extends Graph {
  curie: 'fx:last_transaction';
  links: Transaction['links'];
  props: Transaction['props'];
  zooms: Transaction['zooms'];
}
