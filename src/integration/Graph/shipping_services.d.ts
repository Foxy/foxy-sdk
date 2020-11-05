import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxShippingService } from './shipping_service';
import type { Graph } from '../../core';

export interface FxShippingServices extends Graph {
  curie: 'fx:shipping_services';
  links: CollectionGraphLinks<FxShippingServices>;
  props: CollectionGraphProps;
  child: FxShippingService;
}
