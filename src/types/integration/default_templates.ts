import type * as FxCartIncludeTemplates from "./cart_include_templates";
import type * as FxCheckoutTemplates from "./checkout_templates";
import type * as FxReceiptTemplates from "./receipt_templates";
import type * as FxPropertyHelpers from "./property_helpers";
import type * as FxEmailTemplates from "./email_templates";
import type * as FxCartTemplates from "./cart_templates";

export type Rel = "default_templates";
export type Curie = "fx:default_templates";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Default cart templates. */
  "fx:cart_templates": FxCartTemplates.Graph;
  /** Default email templates. */
  "fx:email_templates": FxEmailTemplates.Graph;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Graph;
  /** Default receipt templates. */
  "fx:receipt_templates": FxReceiptTemplates.Graph;
  /** Default checkout templates. */
  "fx:checkout_templates": FxCheckoutTemplates.Graph;
  /** Default cart include templates. */
  "fx:cart_include_templates": FxCartIncludeTemplates.Graph;
}

export interface Props {
  /** A small, human readable explanation of this property helper. */
  message: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
