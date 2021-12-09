import type { Coupon } from './coupon';
import type { Graph } from '../../core';
import type { ItemCategory } from './item_category';
import type { Store } from './store';

export interface CouponItemCategory extends Graph {
  curie: 'fx:coupon_item_category';

  links: {
    /** This resource. */
    'self': CouponItemCategory;
    /** Store the coupon belongs to. */
    'fx:store': Store;
    /** Coupon this category belongs to. */
    'fx:coupon': Coupon;
    /** Item category this resource links to. */
    'fx:item_category': ItemCategory;
  };

  props: {
    /** The full API URI of the coupon associated with this coupon item category. */
    coupon_uri: string;
    /** The full API URI of the item category associated with this coupon item category. */
    item_category_uri: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
