import type * as FxItemCategory from "./item_category";
import type * as FxStore from "./store";
import type * as FxTax from "./tax";

export type Rel = "tax_item_category";
export type Curie = "fx:tax_item_category";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Related tax resource. */
  "fx:tax": FxTax.Links;
  /** Related store resource. */
  "fx:store": FxStore.Links;
  /** Related item category resource. */
  "fx:item_category": FxItemCategory.Links;
}

export interface Props {
  /** A full API URI of the item category resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
  item_category_uri: string;
  /** A full API URI of the tax resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
  store_uri: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
