import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { ItemCategory } from './item_category';
import type { Graph } from '../../core';

export interface DownloadableItemCategories extends Graph {
  curie: 'fx:downloadable_item_categories';
  links: CollectionGraphLinks<DownloadableItemCategories>;
  props: CollectionGraphProps;
  child: ItemCategory;
}
