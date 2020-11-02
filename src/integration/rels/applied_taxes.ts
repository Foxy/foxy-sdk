import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxAppliedTax } from './applied_tax';

export interface FxAppliedTaxes extends APIGraph {
  curie: 'fx:applied_taxes';
  links: APICollectionGraphLinks<FxAppliedTaxes>;
  props: APICollectionGraphProps;
  child: FxAppliedTax;
}
