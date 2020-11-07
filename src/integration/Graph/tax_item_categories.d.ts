import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxTaxItemCategory } from './tax_item_category';
import type { Graph } from '../../core';

export interface FxTaxItemCategories extends Graph {
  curie: 'fx:tax_item_categories';
  links: CollectionGraphLinks<FxTaxItemCategories>;
  props: CollectionGraphProps;
  child: FxTaxItemCategory;
}
