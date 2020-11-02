import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCart } from './cart';

export interface FxCarts extends APIGraph {
  curie: 'fx:carts';
  links: APICollectionGraphLinks<FxCarts>;
  props: APICollectionGraphProps;
  child: FxCart;
}
