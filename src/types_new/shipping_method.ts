import type * as FxShippingContainers from "./shipping_containers";
import type * as FxShippingDropTypes from "./shipping_drop_types";
import type * as FxShippingServices from "./shipping_services";
import type * as FxShippingMethods from "./shipping_methods";
import type * as FxPropertyHelpers from "./property_helpers";

export type Rel = "shipping_method";
export type Curie = "fx:shipping_method";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** List of all available shipping methods. */
  "fx:shipping_methods": FxShippingMethods.Links;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Links;
  /** List of available shipping services for this shipping method. */
  "fx:shipping_services": FxShippingServices.Links;
  /** List of available shipping containers for this shipping method. */
  "fx:shipping_containers": FxShippingContainers.Links;
  /** List of available shipping drop types for this shipping method. */
  "fx:shipping_drop_types": FxShippingDropTypes.Links;
}

export interface Props {
  /** The name of this shipping method */
  name: string;
  /** The code for this shipping method */
  code: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
