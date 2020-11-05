import type { FxCartIncludeTemplate } from './cart_include_template';
import type { FxCartTemplate } from './cart_template';
import type { FxCheckoutTemplate } from './checkout_template';
import type { FxEmailTemplate } from './email_template';
import type { FxLanguageOverrides } from './language_overrides';
import type { FxReceiptTemplate } from './receipt_template';
import type { FxStore } from './store';
import type { Graph } from '../../core';

export interface FxTemplateSet extends Graph {
  curie: 'fx:template_set';

  links: {
    /** This resource. */
    'self': FxTemplateSet;
    /** Related store resource. */
    'fx:store': FxStore;
    /** Cart template for this template set. */
    'fx:cart_template': FxCartTemplate;
    /** Email template for this template set. */
    'fx:email_template': FxEmailTemplate;
    /** Receipt template for this template set. */
    'fx:receipt_template': FxReceiptTemplate;
    /** Checkout template for this template set. */
    'fx:checkout_template': FxCheckoutTemplate;
    /** Language overrides for this template set. */
    'fx:language_overrides': FxLanguageOverrides;
    /** Cart include template for this template set. */
    'fx:cart_include_template': FxCartIncludeTemplate;
  };

  props: {
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
  };

  zooms: {
    cart_include_template?: FxCartIncludeTemplate;
    checkout_template?: FxCheckoutTemplate;
    receipt_template?: FxReceiptTemplate;
    email_template?: FxEmailTemplate;
    cart_template?: FxCartTemplate;
  };
}
