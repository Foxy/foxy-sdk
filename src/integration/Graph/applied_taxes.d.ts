import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxAppliedTax } from './applied_tax';
import type { Graph } from '../../core';

export interface FxAppliedTaxes extends Graph {
  curie: 'fx:applied_taxes';
  links: CollectionGraphLinks<FxAppliedTaxes>;
  props: CollectionGraphProps;
  child: FxAppliedTax;
}
