import type { Graph } from '../../core';
import type { Transaction } from './transaction';

export interface OriginalTransaction extends Graph {
  curie: 'fx:original_transaction';
  links: Transaction['links'] & { self: OriginalTransaction };
  props: Transaction['props'];
  zooms: Transaction['zooms'];
}
