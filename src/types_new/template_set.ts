import type * as FxCartIncludeTemplate from "./cart_include_template";
import type * as FxLanguageOverrides from "./language_overrides";
import type * as FxCheckoutTemplate from "./checkout_template";
import type * as FxReceiptTemplate from "./receipt_template";
import type * as FxEmailTemplate from "./email_template";
import type * as FxCartTemplate from "./cart_template";
import type * as FxStore from "./store";

export type Rel = "template_set";
export type Curie = "fx:template_set";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Related store resource. */
  "fx:store": FxStore.Links;
  /** Cart template for this template set. */
  "fx:cart_template": FxCartTemplate.Links;
  /** Email template for this template set. */
  "fx:email_template": FxEmailTemplate.Links;
  /** Receipt template for this template set. */
  "fx:receipt_template": FxReceiptTemplate.Links;
  /** Checkout template for this template set. */
  "fx:checkout_template": FxCheckoutTemplate.Links;
  /** Language overrides for this template set. */
  "fx:language_overrides": FxLanguageOverrides.Links;
  /** Cart include template for this template set. */
  "fx:cart_include_template": FxCartIncludeTemplate.Links;
}

export interface Props {
  /** The full API URI of the cart template associated with this template set. */
  cart_template_uri: string;
  /** The full API URI of the cart_include template associated with this template set. */
  cart_include_template_uri: string;
  /** The full API URI of the checkout template associated with this template set. */
  checkout_template_uri: string;
  /** The full API URI of the receipt template associated with this template set. */
  receipt_template_uri: string;
  /** The full API URI of the email template associated with this template set. */
  email_template_uri: string;
  /** The full API URI of the payment method set associated with this template set. */
  payment_method_set_uri: string;
  /** The template set code used when applying this template set to the cart (currently only supports DEFAULT). */
  code: string;
  /** The template set description. (currently only supports the default description). */
  description: string;
  /** The language configured for this template set. */
  language: string;
  /** The locale code for this store. This will impact how the currency and dates are displayed. */
  locale_code: string;
  /** This is the template configuration settings for your store. */
  config: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
