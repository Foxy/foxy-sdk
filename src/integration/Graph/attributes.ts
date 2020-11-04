import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxAttribute } from './attribute';
import type { Graph } from '../../core';

export interface FxAttributes extends Graph {
  curie: 'fx:attributes';
  links: CollectionGraphLinks<FxAttributes>;
  props: CollectionGraphProps;
  child: FxAttribute;
}
