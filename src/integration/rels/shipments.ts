import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxShipment } from './shipment';

export interface FxShipments {
  curie: 'fx:shipments';
  links: CollectionLinks<FxShipments>;
  props: CollectionProps;
  child: FxShipment;
}
