import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxShipment } from './shipment';

export interface FxShipments extends APIGraph {
  curie: 'fx:shipments';
  links: APICollectionGraphLinks<FxShipments>;
  props: APICollectionGraphProps;
  child: FxShipment;
}
