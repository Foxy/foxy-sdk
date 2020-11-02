import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxStoreShippingService } from './store_shipping_service';

export interface FxStoreShippingServices extends APIGraph {
  curie: 'fx:store_shipping_services';
  links: APICollectionGraphLinks<FxStoreShippingServices>;
  props: APICollectionGraphProps;
  child: FxStoreShippingService;
}
