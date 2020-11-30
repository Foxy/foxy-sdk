import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { StoreShippingService } from './store_shipping_service';
import type { Graph } from '../../core';

export interface StoreShippingServices extends Graph {
  curie: 'fx:store_shipping_services';
  links: CollectionGraphLinks<StoreShippingServices>;
  props: CollectionGraphProps;
  child: StoreShippingService;
}
