import type * as FxItemCategory from "./item_category";
import type * as FxCoupon from "./coupon";
import type * as FxStore from "./store";

type Curie = "fx:coupon_item_category";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Store the coupon belongs to. */
  "fx:store": FxStore.Graph;
  /** Coupon this category belongs to. */
  "fx:coupon": FxCoupon.Graph;
  /** Item category this resource links to. */
  "fx:item_category": FxItemCategory.Graph;
}

interface Props {
  /** The full API URI of the coupon associated with this coupon item category. */
  coupon_uri: string;
  /** The full API URI of the item category associated with this coupon item category. */
  item_category_uri: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
