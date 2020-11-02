import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxItemCategory } from './item_category';

export interface FxItemCategories extends APIGraph {
  curie: 'fx:item_categories';
  links: APICollectionGraphLinks<FxItemCategories>;
  props: APICollectionGraphProps;
  child: FxItemCategory;
}
