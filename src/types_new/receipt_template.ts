import type * as FxTemplateSets from "./template_sets";
import type * as FxEncode from "./encode";
import type * as FxCache from "./cache";
import type * as FxStore from "./store";

export type Rel = "receipt_template";
export type Curie = "fx:receipt_template";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Related store resource. */
  "fx:store": FxStore.Links;
  /** POST here to cache your template using the `content_url`. */
  "fx:cache": FxCache.Links;
  /** POST here to encode a body of html for use with our HMAC cart encryption. */
  "fx:encode": FxEncode.Links;
  /** Template sets using this template. */
  "fx:template_sets": FxTemplateSets.Links;
}

export interface Props {
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
}

export type Zoom = never;
