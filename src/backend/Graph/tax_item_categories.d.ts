import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { TaxItemCategory } from './tax_item_category';

export interface TaxItemCategories extends Graph {
  curie: 'fx:tax_item_categories';
  links: CollectionGraphLinks<TaxItemCategories>;
  props: CollectionGraphProps;
  child: TaxItemCategory;
}
