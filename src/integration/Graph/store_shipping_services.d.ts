import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxStoreShippingService } from './store_shipping_service';
import type { Graph } from '../../core';

export interface FxStoreShippingServices extends Graph {
  curie: 'fx:store_shipping_services';
  links: CollectionGraphLinks<FxStoreShippingServices>;
  props: CollectionGraphProps;
  child: FxStoreShippingService;
}
