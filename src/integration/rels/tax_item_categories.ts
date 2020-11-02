import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxTaxItemCategory } from './tax_item_category';

export interface FxTaxItemCategories extends APIGraph {
  curie: 'fx:tax_item_categories';
  links: APICollectionGraphLinks<FxTaxItemCategories>;
  props: APICollectionGraphProps;
  child: FxTaxItemCategory;
}
