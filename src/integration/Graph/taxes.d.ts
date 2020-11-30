import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Tax } from './tax';
import type { Graph } from '../../core';

export interface Taxes extends Graph {
  curie: 'fx:taxes';
  links: CollectionGraphLinks<Taxes>;
  props: CollectionGraphProps;
  child: Tax;
}
