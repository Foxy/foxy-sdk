import type * as FxTemplateSets from "./template_sets";
import type * as FxEncode from "./encode";
import type * as FxStore from "./store";
import type * as FxCache from "./cache";

export type Rel = "checkout_template";
export type Curie = "fx:checkout_template";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Store this template belongs to. */
  "fx:store": FxStore.Graph;
  /** POST here to cache your template using the `content_url`. */
  "fx:cache": FxCache.Graph;
  /** POST here to encode a body of html for use with our HMAC cart encryption. */
  "fx:encode": FxEncode.Graph;
  /** Template sets using this template. */
  "fx:template_sets": FxTemplateSets.Graph;
}

export interface Props {
  /** The description of your checkout template. */
  description: string;
  /** The content of your checkout template. Leave blank to use the default responsive template. This shouldn't be set directly unless all of your image references are already over https. If they are not, set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
  content: string;
  /** The URL of your checkout template hosted on your own server online and publicly available for our server to cache. */
  content_url: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
