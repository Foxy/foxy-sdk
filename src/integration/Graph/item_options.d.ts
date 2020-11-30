import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { ItemOption } from './item_option';

export interface ItemOptions extends Graph {
  curie: 'fx:item_options';
  links: CollectionGraphLinks<ItemOptions>;
  props: CollectionGraphProps;
  child: ItemOption;
}
