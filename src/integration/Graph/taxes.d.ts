import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Tax } from './tax';

export interface Taxes extends Graph {
  curie: 'fx:taxes';
  links: CollectionGraphLinks<Taxes>;
  props: CollectionGraphProps;
  child: Tax;
}
