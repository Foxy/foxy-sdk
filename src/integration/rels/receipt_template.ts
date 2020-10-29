import type { FxTemplateSets } from './template_sets';
import type { FxEncode } from './encode';
import type { FxCache } from './cache';
import type { FxStore } from './store';

export interface FxReceiptTemplate {
  curie: 'fx:receipt_template';

  links: {
    /** This resource. */
    'self': FxReceiptTemplate;
    /** Related store resource. */
    'fx:store': FxStore;
    /** POST here to cache your template using the `content_url`. */
    'fx:cache': FxCache;
    /** POST here to encode a body of html for use with our HMAC cart encryption. */
    'fx:encode': FxEncode;
    /** Template sets using this template. */
    'fx:template_sets': FxTemplateSets;
  };

  props: {
    /** The description of your receipt template. */
    description: string;
    /** The content of your receipt template. Leave blank to use the default responsive template. This shouldn't be set directly unless all of your image references are already over https. If they are not, set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content: string;
    /** The URL of your receipt template hosted on your own server online and publicly available for our server to cache. */
    content_url: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
