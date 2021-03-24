import type { Graph } from '../../core';
import type { Item } from './item';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface DiscountDetail extends Graph {
  curie: 'fx:discount_detail';

  links: {
    /** This resource. */
    'self': DiscountDetail;
    /** Item the discount was applied to. */
    'fx:item': Item;
    /** Store that provided the discount. */
    'fx:store': Store;
    /** Transaction the discount was applied to. */
    'fx:transaction': Transaction;
  };

  props: {
    /** The ID of this coupon detail. */
    id: string;
    /** The original coupon name used for this discount. */
    name: string;
    /** The amount of discount applied to this item. */
    amount_per: number;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
