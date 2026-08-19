import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Attribute } from './attribute';
import type { Graph } from '../../core';

export interface Attributes extends Graph {
  curie: 'fx:attributes';
  links: CollectionGraphLinks<Attributes>;
  props: CollectionGraphProps;
  child: Attribute;
}
