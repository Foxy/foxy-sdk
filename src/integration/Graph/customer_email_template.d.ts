import type { Cache } from './cache';
import type { EmailTemplate } from './email_template';
import type { Store } from './store';
import type { TemplateSets } from './template_sets';
import type { Graph } from '../../core';

export interface CustomerEmailTemplate extends Graph {
  curie: 'fx:customer_email_template';

  links: {
    /** This resource. */
    'self': CustomerEmailTemplate;
    /** Store this template belongs to. */
    'fx:store': Store;
    /** POST here to cache your template using the `content_html_url` and `content_text_url`. */
    'fx:cache': Cache;
    /** Template sets using this template. */
    'fx:template_sets': TemplateSets;
  };

  props: EmailTemplate['props'];
}
