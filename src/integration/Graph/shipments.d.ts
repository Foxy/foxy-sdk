import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Shipment } from './shipment';
import type { Graph } from '../../core';

export interface Shipments extends Graph {
  curie: 'fx:shipments';
  links: CollectionGraphLinks<Shipments>;
  props: CollectionGraphProps;
  child: Shipment;
}
