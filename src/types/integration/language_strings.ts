import type * as FxPropertyHelpers from "./property_helpers";

interface StringRecord {
  [key: string]: StringRecord;
}

type Curie = "fx:language_strings";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Graph;
}

interface Props {
  /** A small, human readable explanation of this property helper. */
  message: string;
  /** JSON objects with the language strings supported. The key values match the language property and each pair represents the language_override `code` and `custom_value`. */
  values: StringRecord;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
