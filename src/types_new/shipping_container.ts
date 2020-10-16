import type * as FxShippingContainers from "./shipping_containers";
import type * as FxPropertyHelpers from "./property_helpers";
import type * as FxShippingMethods from "./shipping_methods";
import type * as FxShippingMethod from "./shipping_method";

export type Rel = "shipping_container";
export type Curie = "fx:shipping_container";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Shipping method that will be used to deliver this container. */
  "fx:shipping_method": FxShippingMethod.Links;
  /** List of all available shipping methods. */
  "fx:shipping_methods": FxShippingMethods.Links;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Links;
  /** List of all shipping containers for the shipping method. */
  "fx:shipping_containers": FxShippingContainers.Links;
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

export type Zoom = never;
