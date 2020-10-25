import type * as FxTransaction from "./transaction";
import type * as FxStore from "./store";
import type * as FxItem from "./item";

type Curie = "fx:item_option";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Item this option is attached to. */
  "fx:item": FxItem.Graph;
  /** Store the item belongs to. */
  "fx:store": FxStore.Graph;
  /** Related transaction resource. */
  "fx:transaction": FxTransaction.Graph;
}

interface Props {
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

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
