import type * as FxShippingContainers from "./shipping_containers";
import type * as FxPropertyHelpers from "./property_helpers";
import type * as FxShippingMethods from "./shipping_methods";
import type * as FxShippingMethod from "./shipping_method";

export type Rel = "shipping_container";
export type Curie = "fx:shipping_container";
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
  /** List of all shipping containers for the shipping method. */
  "fx:shipping_containers": FxShippingContainers.Graph;
}

export interface Props {
  /** The name of this shipping container */
  name: string;
  /** The code for this shipping container */
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
