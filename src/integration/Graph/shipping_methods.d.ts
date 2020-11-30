import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { ShippingMethod } from './shipping_method';
import type { Graph } from '../../core';

export interface ShippingMethods extends Graph {
  curie: 'fx:shipping_methods';
  links: CollectionGraphLinks<ShippingMethods>;
  props: CollectionGraphProps;
  child: ShippingMethod;
}
