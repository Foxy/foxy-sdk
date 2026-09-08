import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Shipment } from './shipment';

export interface Shipments extends Graph {
  curie: 'fx:shipments';
  links: CollectionGraphLinks<Shipments>;
  props: CollectionGraphProps;
  child: Shipment;
}
