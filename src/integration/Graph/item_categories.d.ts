import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxItemCategory } from './item_category';
import type { Graph } from '../../core';

export interface FxItemCategories extends Graph {
  curie: 'fx:item_categories';
  links: CollectionGraphLinks<FxItemCategories>;
  props: CollectionGraphProps;
  child: FxItemCategory;
}
