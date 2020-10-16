import type * as FxDefaultStore from "./default_store";
import type * as FxAttributes from "./attributes";
import type * as FxStores from "./stores";

export type Rel = "user";
export type Curie = "fx:user";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** List of stores this user has access to. */
  "fx:stores": FxStores.Links;
  /** List of custom attributes on this user resource. */
  "fx:attributes": FxAttributes.Links;
  /** Default store for this user. */
  "fx:default_store": FxDefaultStore.Links;
}

export interface Props {
  /** The user's given name. */
  first_name: string;
  /** The user's surname. */
  last_name: string;
  /** The user's email address. This is used as the login to the FoxyCart admin for this user. */
  email: string;
  /** The user's phone number. */
  phone: string;
  /** This can only be set during user creation. Contact us if you need this value changed later. */
  affiliate_id: number;
  /** If this user is a programmer who writes server side code in languages like PHP, .NET, Python, Java, Ruby, etc */
  is_programmer: boolean;
  /** If this user is a front end developer who writes code in things like HTML, CSS, and maybe some JavaScript. */
  is_front_end_developer: boolean;
  /** If this user is a front end designer who works in wireframes, graphic designs, and user interfaces. */
  is_designer: boolean;
  /** If this user is a a merchant or store admin involved in the item and money side of the e-commerce business. */
  is_merchant: boolean;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
