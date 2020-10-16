import type * as FxShippingMethods from "./shipping_methods";
import type * as FxPropertyHelpers from "./property_helpers";
import type * as FxShippingMethod from "./shipping_method";

export type Rel = "shipping_service";
export type Curie = "fx:shipping_service";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Shipping method associated with this shipping service. */
  "fx:shipping_method": FxShippingMethod.Links;
  /** List of all available shipping methods. */
  "fx:shipping_methods": FxShippingMethods.Links;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Links;
}

export interface Props {
  /** The name of this shipping service */
  name: string;
  /** The code for this shipping service */
  code: string;
  /** Specifies whether or not this shipping service is for international rate requests only. */
  is_international: boolean;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
