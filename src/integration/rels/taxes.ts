import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxTax } from './tax';

export interface FxTaxes extends APIGraph {
  curie: 'fx:taxes';
  links: APICollectionGraphLinks<FxTaxes>;
  props: APICollectionGraphProps;
  child: FxTax;
}
