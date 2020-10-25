import type * as FxDefaultStore from "./default_store";
import type * as FxAttributes from "./attributes";
import type * as FxStores from "./stores";

type Curie = "fx:user";

interface Links {
  /** This resource. */
  "self": Graph;
  /** List of stores this user has access to. */
  "fx:stores": FxStores.Graph;
  /** List of custom attributes on this user resource. */
  "fx:attributes": FxAttributes.Graph;
  /** Default store for this user. */
  "fx:default_store": FxDefaultStore.Graph;
}

interface Props {
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

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
