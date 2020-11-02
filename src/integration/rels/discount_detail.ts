import type { APIGraph } from '../../core/types';
import type { FxItem } from './item';
import type { FxStore } from './store';
import type { FxTransaction } from './transaction';

export interface FxDiscountDetail extends APIGraph {
  curie: 'fx:discount_detail';

  links: {
    /** This resource. */
    'self': FxDiscountDetail;
    /** Item the discount was applied to. */
    'fx:item': FxItem;
    /** Store that provided the discount. */
    'fx:store': FxStore;
    /** Transaction the discount was applied to. */
    'fx:transaction': FxTransaction;
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
