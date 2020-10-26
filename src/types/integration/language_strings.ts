import type { FxPropertyHelpers } from "./property_helpers";

interface StringRecord {
  [key: string]: StringRecord;
}

export interface FxLanguageStrings {
  curie: "fx:language_strings";

  links: {
    /** This resource. */
    "self": FxLanguageStrings;
    /** Various predefined property values. */
    "fx:property_helpers": FxPropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the language strings supported. The key values match the language property and each pair represents the language_override `code` and `custom_value`. */
    values: StringRecord;
  };
}
