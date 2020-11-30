import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Item } from './item';
import type { Graph } from '../../core';

export interface Items extends Graph {
  curie: 'fx:items';
  links: CollectionGraphLinks<Items>;
  props: CollectionGraphProps;
  child: Item;
}
