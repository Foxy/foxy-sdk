import type * as FxTemplateSets from "./template_sets";
import type * as FxStore from "./store";
import type * as FxCache from "./cache";

export type Rel = "email_template";
export type Curie = "fx:email_template";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** POST here to cache your template using the `content_html_url` and `content_text_url`. */
  "fx:cache": FxCache.Graph;
  /** Store this template belongs to. */
  "fx:store": FxStore.Graph;
  /** Template sets using this template. */
  "fx:template_sets": FxTemplateSets.Graph;
}

export interface Props {
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
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
