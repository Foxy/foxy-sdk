import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { TaxItemCategory } from './tax_item_category';
import type { Graph } from '../../core';

export interface TaxItemCategories extends Graph {
  curie: 'fx:tax_item_categories';
  links: CollectionGraphLinks<TaxItemCategories>;
  props: CollectionGraphProps;
  child: TaxItemCategory;
}
