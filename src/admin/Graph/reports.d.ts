import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Report } from './report';

export interface Reports extends Graph {
  curie: 'fx:reports';
  links: CollectionGraphLinks<Reports>;
  props: CollectionGraphProps;
  child: Report;
}
