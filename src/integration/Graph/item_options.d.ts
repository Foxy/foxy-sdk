import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { ItemOption } from './item_option';
import type { Graph } from '../../core';

export interface ItemOptions extends Graph {
  curie: 'fx:item_options';
  links: CollectionGraphLinks<ItemOptions>;
  props: CollectionGraphProps;
  child: ItemOption;
}
