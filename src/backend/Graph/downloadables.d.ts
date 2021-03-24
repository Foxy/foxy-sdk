import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Downloadable } from './downloadable';
import type { Graph } from '../../core';

export interface Downloadables extends Graph {
  curie: 'fx:downloadables';
  links: CollectionGraphLinks<Downloadables>;
  props: CollectionGraphProps;
  child: Downloadable;
}
