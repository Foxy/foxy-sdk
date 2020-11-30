import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { ItemCategory } from './item_category';

export interface DownloadableItemCategories extends Graph {
  curie: 'fx:downloadable_item_categories';
  links: CollectionGraphLinks<DownloadableItemCategories>;
  props: CollectionGraphProps;
  child: ItemCategory;
}
