import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxShippingMethod } from './shipping_method';
import type { Graph } from '../../core';

export interface FxShippingMethods extends Graph {
  curie: 'fx:shipping_methods';
  links: CollectionGraphLinks<FxShippingMethods>;
  props: CollectionGraphProps;
  child: FxShippingMethod;
}
