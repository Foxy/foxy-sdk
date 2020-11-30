import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { ItemCategory } from './item_category';
import type { Graph } from '../../core';

export interface ItemCategories extends Graph {
  curie: 'fx:item_categories';
  links: CollectionGraphLinks<ItemCategories>;
  props: CollectionGraphProps;
  child: ItemCategory;
}
