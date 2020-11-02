import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxShippingContainer } from './shipping_container';

export interface FxShippingContainers extends APIGraph {
  curie: 'fx:shipping_containers';
  links: APICollectionGraphLinks<FxShippingContainers>;
  props: APICollectionGraphProps;
  child: FxShippingContainer;
}
