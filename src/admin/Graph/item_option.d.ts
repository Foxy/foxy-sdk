import type { Graph } from '../../core';
import type { Item } from './item';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface ItemOption extends Graph {
  curie: 'fx:item_option';

  links: {
    /** This resource. */
    'self': ItemOption;
    /** Item this option is attached to. */
    'fx:item': Item;
    /** Store the item belongs to. */
    'fx:store': Store;
    /** Related transaction resource. */
    'fx:transaction': Transaction;
  };

  props: {
    /** The name of this item option. */
    name: string;
    /** The value of this item option. */
    value: string;
    /** The price modifier for this item option. The price of the item in the cart will be adjusted by this amount because of this item option. */
    price_mod: number;
    /** The weight modifier for this item option. The weight of the item in the cart will be adjusted by this amount because of this item option. */
    weight_mod: number;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
