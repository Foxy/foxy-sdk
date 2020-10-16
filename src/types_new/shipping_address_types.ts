import type * as FxPropertyHelpers from "./property_helpers";

export type Rel = "shipping_address_types";
export type Curie = "fx:shipping_address_types";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Links;
}
export interface Props {
  /** A small, human readable explanation of this property helper. */
  message: string;
  /** JSON objects with the checkout types supported. The key values are the values you use for the Store resource's `shipping_address_type` property. */
  values: Record<string, string>;
}

export type Zoom = never;
