import type { Graph } from '../../core';
import type { PropertyHelpers } from './property_helpers';

export interface LanguageStrings extends Graph {
  curie: 'fx:language_strings';

  links: {
    /** This resource. */
    'self': LanguageStrings;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the language strings supported. The key values match the language property and each pair represents the language_override `code` and `custom_value`. */
    values: Record<string, Record<string, string | Record<string, Record<string, string>>>>;
  };
}
