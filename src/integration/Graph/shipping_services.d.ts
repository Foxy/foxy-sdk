import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { ShippingService } from './shipping_service';
import type { Graph } from '../../core';

export interface ShippingServices extends Graph {
  curie: 'fx:shipping_services';
  links: CollectionGraphLinks<ShippingServices>;
  props: CollectionGraphProps;
  child: ShippingService;
}
