import type { FxLanguageOverrides } from "./language_overrides";
import type { FxTemplateSet } from "./template_set";
import type { FxStore } from "./store";

export interface FxLanguageOverride {
  curie: "fx:language_override";

  links: {
    /** This resource. */
    "self": FxLanguageOverride;
    /** Store this language override is registered in. */
    "fx:store": FxStore;
    /** Template set this language override belongs to. */
    "fx:template_set": FxTemplateSet;
    /** List of all language overrides in the template set. */
    "fx:language_overrides": FxLanguageOverrides;
  };

  props: {
    /** The code for this language string. This is the same code you will see in the `FC.json.config.lang` array. */
    code: string;
    /** For the language strings specific to a payment gateway, enter the gateway key here. */
    gateway: string;
    /** Your custom string for this language code. */
    custom_value: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
