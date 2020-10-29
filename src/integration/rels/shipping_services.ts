import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxShippingService } from './shipping_service';

export interface FxShippingServices {
  curie: 'fx:shipping_services';
  links: CollectionLinks<FxShippingServices>;
  props: CollectionProps;
  child: FxShippingService;
}
