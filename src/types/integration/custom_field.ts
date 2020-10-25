import type * as FxTransaction from "./transaction";
import type * as FxStore from "./store";

export type Rel = "custom_field";
export type Curie = "fx:custom_field";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Store this custom field was created in. */
  "fx:store": FxStore.Graph;
  /** Transaction this custom field is linked to. */
  "fx:transaction": FxTransaction.Graph;
}

export interface Props {
  /** The name of the custom field. */
  name: string;
  /** The value of this custom field. */
  value: string;
  /** Whether or not this custom field is visible on the receipt and email receipt. This correlates to custom fields with a "h:" prefix when added to the cart. */
  is_hidden: boolean;
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
