import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Cart } from './cart';
import type { Graph } from '../../core';

export interface Carts extends Graph {
  curie: 'fx:carts';
  links: CollectionGraphLinks<Carts>;
  props: CollectionGraphProps;
  child: Cart;
}
