import type { APIGraph } from '../../core/types';
import type { FxCoupon } from './coupon';
import type { FxItemCategory } from './item_category';
import type { FxStore } from './store';

export interface FxCouponItemCategory extends APIGraph {
  curie: 'fx:coupon_item_category';

  links: {
    /** This resource. */
    'self': FxCouponItemCategory;
    /** Store the coupon belongs to. */
    'fx:store': FxStore;
    /** Coupon this category belongs to. */
    'fx:coupon': FxCoupon;
    /** Item category this resource links to. */
    'fx:item_category': FxItemCategory;
  };

  props: {
    /** The full API URI of the coupon associated with this coupon item category. */
    coupon_uri: string;
    /** The full API URI of the item category associated with this coupon item category. */
    item_category_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
