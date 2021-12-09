import type { Cache } from './cache';
import type { Encode } from './encode';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { TemplateSets } from './template_sets';

export interface CheckoutTemplate extends Graph {
  curie: 'fx:checkout_template';

  links: {
    /** This resource. */
    'self': CheckoutTemplate;
    /** Store this template belongs to. */
    'fx:store': Store;
    /** POST here to cache your template using the `content_url`. */
    'fx:cache': Cache;
    /** POST here to encode a body of html for use with our HMAC cart encryption. */
    'fx:encode': Encode;
    /** Template sets using this template. */
    'fx:template_sets': TemplateSets;
  };

  props: {
    /** The description of your checkout template. */
    description: string;
    /** The content of your checkout template. Leave blank to use the default responsive template. This shouldn't be set directly unless all of your image references are already over https. If they are not, set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content: string;
    /** The URL of your checkout template hosted on your own server online and publicly available for our server to cache. */
    content_url: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
