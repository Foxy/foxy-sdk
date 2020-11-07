import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxTax } from './tax';
import type { Graph } from '../../core';

export interface FxTaxes extends Graph {
  curie: 'fx:taxes';
  links: CollectionGraphLinks<FxTaxes>;
  props: CollectionGraphProps;
  child: FxTax;
}
