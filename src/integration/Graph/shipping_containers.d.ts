import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { ShippingContainer } from './shipping_container';
import type { Graph } from '../../core';

export interface ShippingContainers extends Graph {
  curie: 'fx:shipping_containers';
  links: CollectionGraphLinks<ShippingContainers>;
  props: CollectionGraphProps;
  child: ShippingContainer;
}
