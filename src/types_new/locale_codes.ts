import type * as FxPropertyHelpers from "./property_helpers";

export type Rel = "locale_codes";
export type Curie = "fx:locale_codes";
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
  /** JSON objects with the locale codes supported. The key values are the values you use for the Store resource's `locale_code` property. */
  values: Record<string, string>;
}

export type Zoom = never;
