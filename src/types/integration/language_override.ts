import type * as FxLanguageOverrides from "./language_overrides";
import type * as FxTemplateSet from "./template_set";
import type * as FxStore from "./store";

export type Rel = "language_override";
export type Curie = "fx:language_override";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Store this language override is registered in. */
  "fx:store": FxStore.Graph;
  /** Template set this language override belongs to. */
  "fx:template_set": FxTemplateSet.Graph;
  /** List of all language overrides in the template set. */
  "fx:language_overrides": FxLanguageOverrides.Graph;
}

export interface Props {
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
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
