import type * as FxPropertyHelpers from "./property_helpers";

export type Rel = "timezones";
export type Curie = "fx:timezones";
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
  /** JSON object with an array of timezones. */
  values: {
    /** Valid entries for the store resource's timezone property. */
    timezone: {
      /** The value you can use for the store's timezone property. */
      timezone: string;
      /** The full description of this timezone. */
      description: string;
    }[];
  };
}

export type Zoom = never;
