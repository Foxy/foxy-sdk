import type * as FxTransaction from "./transaction";
import type * as FxStore from "./store";
import type * as FxItem from "./item";

export type Rel = "item_option";
export type Curie = "fx:item_option";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Item this option is attached to. */
  "fx:item": FxItem.Links;
  /** Store the item belongs to. */
  "fx:store": FxStore.Links;
  /** Related transaction resource. */
  "fx:transaction": FxTransaction.Links;
}

export interface Props {
  /** The name of this item option. */
  name: string;
  /** The value of this item option. */
  value: string;
  /** The price modifier for this item option. The price of the item in the cart will be adjusted by this amount because of this item option. */
  price_mod: number;
  /** The weight modifier for this item option. The weight of the item in the cart will be adjusted by this amount because of this item option. */
  weight_mod: number;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
