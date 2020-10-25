import type * as FxTransaction from "./transaction";
import type * as FxStore from "./store";
import type * as FxItem from "./item";

export type Rel = "discount_detail";
export type Curie = "fx:discount_detail";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Item the discount was applied to. */
  "fx:item": FxItem.Graph;
  /** Store that provided the discount. */
  "fx:store": FxStore.Graph;
  /** Transaction the discount was applied to. */
  "fx:transaction": FxTransaction.Graph;
}

export interface Props {
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
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
