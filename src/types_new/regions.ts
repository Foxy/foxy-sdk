import type * as FxPropertyHelpers from "./property_helpers";

export type Rel = "regions";
export type Curie = "fx:regions";
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
  /** JSON objects with the region codes as the keys. */
  values: {
    [key: string]: {
      /** The default name for this region. */
      default: string;
      /** The code for this region. */
      code: string;
      /** The official 3 character country code. */
      cc3: string;
      /** Array of alternative names for this region. */
      alternate_values: string[];
      /** This value determines which regions will show up first in our find-as-you-type system. */
      boost: number;
      /** True if this region is currently recognized. */
      active: boolean;
    };
  };
}

export type Zoom = never;
