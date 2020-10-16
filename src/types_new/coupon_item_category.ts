import type * as FxItemCategory from "./item_category";
import type * as FxCoupon from "./coupon";
import type * as FxStore from "./store";

export type Rel = "coupon_item_category";
export type Curie = "fx:coupon_item_category";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Store the coupon belongs to. */
  "fx:store": FxStore.Links;
  /** Coupon this category belongs to. */
  "fx:coupon": FxCoupon.Links;
  /** Item category this resource links to. */
  "fx:item_category": FxItemCategory.Links;
}

export interface Props {
  /** The full API URI of the coupon associated with this coupon item category. */
  coupon_uri: string;
  /** The full API URI of the item category associated with this coupon item category. */
  item_category_uri: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
