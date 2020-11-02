import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxShippingService } from './shipping_service';

export interface FxShippingServices extends APIGraph {
  curie: 'fx:shipping_services';
  links: APICollectionGraphLinks<FxShippingServices>;
  props: APICollectionGraphProps;
  child: FxShippingService;
}
