import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxShipment } from './shipment';
import type { Graph } from '../../core';

export interface FxShipments extends Graph {
  curie: 'fx:shipments';
  links: CollectionGraphLinks<FxShipments>;
  props: CollectionGraphProps;
  child: FxShipment;
}
