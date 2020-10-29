import type { FxCartIncludeTemplates } from './cart_include_templates';
import type { FxCheckoutTemplates } from './checkout_templates';
import type { FxReceiptTemplates } from './receipt_templates';
import type { FxPropertyHelpers } from './property_helpers';
import type { FxEmailTemplates } from './email_templates';
import type { FxCartTemplates } from './cart_templates';

export interface FxDefaultTemplates {
  curie: 'fx:default_templates';

  links: {
    /** This resource. */
    'self': FxDefaultTemplates;
    /** Default cart templates. */
    'fx:cart_templates': FxCartTemplates;
    /** Default email templates. */
    'fx:email_templates': FxEmailTemplates;
    /** Various predefined property values. */
    'fx:property_helpers': FxPropertyHelpers;
    /** Default receipt templates. */
    'fx:receipt_templates': FxReceiptTemplates;
    /** Default checkout templates. */
    'fx:checkout_templates': FxCheckoutTemplates;
    /** Default cart include templates. */
    'fx:cart_include_templates': FxCartIncludeTemplates;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
  };
}
