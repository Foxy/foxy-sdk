import type * as FxPropertyHelpers from "./property_helpers";

type Curie = "fx:timezones";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Graph;
}

interface Props {
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

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
