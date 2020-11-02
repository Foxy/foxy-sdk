import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxItemCategory } from './item_category';

export interface FxDownloadableItemCategories extends APIGraph {
  curie: 'fx:downloadable_item_categories';
  links: APICollectionGraphLinks<FxDownloadableItemCategories>;
  props: APICollectionGraphProps;
  child: FxItemCategory;
}
