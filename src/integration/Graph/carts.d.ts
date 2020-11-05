import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCart } from './cart';
import type { Graph } from '../../core';

export interface FxCarts extends Graph {
  curie: 'fx:carts';
  links: CollectionGraphLinks<FxCarts>;
  props: CollectionGraphProps;
  child: FxCart;
}
