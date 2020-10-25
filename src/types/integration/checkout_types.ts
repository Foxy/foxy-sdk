import type * as FxPropertyHelpers from "./property_helpers";

type Curie = "fx:checkout_types";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Various pre-defined property values. */
  "fx:property_helpers": FxPropertyHelpers.Graph;
}

interface Props {
  /** A small, human readable explanation of this property helper. */
  message: string;
  /** JSON objects with the checkout types supported. The key values are the values you use for the Store resource's `checkout_type` property. */
  values: Record<string, string>;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
