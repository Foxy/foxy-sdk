import type { CartIncludeTemplates } from './cart_include_templates';
import type { CartTemplates } from './cart_templates';
import type { CheckoutTemplates } from './checkout_templates';
import type { EmailTemplates } from './email_templates';
import type { PropertyHelpers } from './property_helpers';
import type { ReceiptTemplates } from './receipt_templates';
import type { Graph } from '../../core';

export interface DefaultTemplates extends Graph {
  curie: 'fx:default_templates';

  links: {
    /** This resource. */
    'self': DefaultTemplates;
    /** Default cart templates. */
    'fx:cart_templates': CartTemplates;
    /** Default email templates. */
    'fx:email_templates': EmailTemplates;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
    /** Default receipt templates. */
    'fx:receipt_templates': ReceiptTemplates;
    /** Default checkout templates. */
    'fx:checkout_templates': CheckoutTemplates;
    /** Default cart include templates. */
    'fx:cart_include_templates': CartIncludeTemplates;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
  };
}
