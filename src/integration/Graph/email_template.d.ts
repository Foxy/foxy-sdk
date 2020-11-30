import type { Cache } from './cache';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { TemplateSets } from './template_sets';

export interface EmailTemplate extends Graph {
  curie: 'fx:email_template';

  links: {
    /** This resource. */
    'self': EmailTemplate;
    /** POST here to cache your template using the `content_html_url` and `content_text_url`. */
    'fx:cache': Cache;
    /** Store this template belongs to. */
    'fx:store': Store;
    /** Template sets using this template. */
    'fx:template_sets': TemplateSets;
  };

  props: {
    /** The description of your email template. */
    description: string;
    /** The content of your html email template. Leave blank to use the default responsive template. You can set the content directly or set the `content_html_url` to point to your template content online and then POST to the `cache` link relationship. */
    content_html: string;
    /** The URL of your html email template hosted on your own server online and publicly available for our server to cache. */
    content_html_url: string;
    /** The content of your text email template. Leave blank to use the default template. You can set the content directly or set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content_text: string;
    /** The URL of your text email template hosted on your own server online and publicly available for our server to cache. */
    content_text_url: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
