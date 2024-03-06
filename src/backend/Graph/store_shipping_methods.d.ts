import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { StoreShippingMethod } from './store_shipping_method';
import type { Graph } from '../../core';

export interface StoreShippingMethods extends Graph {
  curie: 'fx:store_shipping_methods';
  links: CollectionGraphLinks<StoreShippingMethods>;
  props: CollectionGraphProps;
  child: StoreShippingMethod;
}
