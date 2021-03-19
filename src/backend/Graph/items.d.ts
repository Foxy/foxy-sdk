import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Item } from './item';

export interface Items extends Graph {
  curie: 'fx:items';
  links: CollectionGraphLinks<Items>;
  props: CollectionGraphProps;
  child: Item;
}
