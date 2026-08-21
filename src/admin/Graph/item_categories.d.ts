import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { ItemCategory } from './item_category';

export interface ItemCategories extends Graph {
  curie: 'fx:item_categories';
  links: CollectionGraphLinks<ItemCategories>;
  props: CollectionGraphProps;
  child: ItemCategory;
}
