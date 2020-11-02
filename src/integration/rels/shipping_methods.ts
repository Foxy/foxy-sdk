import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxShippingMethod } from './shipping_method';

export interface FxShippingMethods extends APIGraph {
  curie: 'fx:shipping_methods';
  links: APICollectionGraphLinks<FxShippingMethods>;
  props: APICollectionGraphProps;
  child: FxShippingMethod;
}
