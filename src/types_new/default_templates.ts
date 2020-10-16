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
  "self": Links;
  /** Default cart templates. */
  "fx:cart_templates": FxCartTemplates.Links;
  /** Default email templates. */
  "fx:email_templates": FxEmailTemplates.Links;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Links;
  /** Default receipt templates. */
  "fx:receipt_templates": FxReceiptTemplates.Links;
  /** Default checkout templates. */
  "fx:checkout_templates": FxCheckoutTemplates.Links;
  /** Default cart include templates. */
  "fx:cart_include_templates": FxCartIncludeTemplates.Links;
}

export interface Props {
  /** A small, human readable explanation of this property helper. */
  message: string;
}

export type Zoom = never;
