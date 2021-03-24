import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { AppliedTax } from './applied_tax';
import type { Graph } from '../../core';

export interface AppliedTaxes extends Graph {
  curie: 'fx:applied_taxes';
  links: CollectionGraphLinks<AppliedTaxes>;
  props: CollectionGraphProps;
  child: AppliedTax;
}
