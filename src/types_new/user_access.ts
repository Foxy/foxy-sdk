import type * as FxStore from "./store";
import type * as FxUser from "./user";

export type Rel = "user_access";
export type Curie = "fx:user_access";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Related user resource. */
  "fx:user": FxUser.Links;
  /** Related store resource. */
  "fx:store": FxStore.Links;
}

export interface Props {
  /** A full API URI of the user resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
  user_uri: string;
  /** A full API URI of the store resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
  store_uri: string;
  /** Set this to true to make this store the default store for this user. That means it will be the first store they see when the log in to the FoxyCart admin. */
  is_default_store: boolean;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
