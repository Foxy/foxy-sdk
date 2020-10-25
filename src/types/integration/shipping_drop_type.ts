import type * as FxShippingDropTypes from "./shipping_drop_types";
import type * as FxPropertyHelpers from "./property_helpers";
import type * as FxShippingMethods from "./shipping_methods";
import type * as FxShippingMethod from "./shipping_method";

export type Rel = "shipping_drop_type";
export type Curie = "fx:shipping_drop_type";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Shipping method that will be used to deliver this container. */
  "fx:shipping_method": FxShippingMethod.Graph;
  /** List of all available shipping methods. */
  "fx:shipping_methods": FxShippingMethods.Graph;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Graph;
  /** List of all drop types for the shipping method. */
  "fx:shipping_drop_types": FxShippingDropTypes.Graph;
}

export interface Props {
  /** The name of this shipping drop type */
  name: string;
  /** The code for this shipping drop type */
  code: string;
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
