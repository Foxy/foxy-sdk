import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxItemCategory } from './item_category';
import type { Graph } from '../../core';

export interface FxDownloadableItemCategories extends Graph {
  curie: 'fx:downloadable_item_categories';
  links: CollectionGraphLinks<FxDownloadableItemCategories>;
  props: CollectionGraphProps;
  child: FxItemCategory;
}
