import type * as FxPropertyHelpers from "./property_helpers";
import type * as FxReporting from "./reporting";
import type * as FxEncode from "./encode";
import type * as FxStores from "./stores";
import type * as FxStore from "./store";
import type * as FxToken from "./token";
import type * as FxUser from "./user";

export type Rel = never;
export type Curie = never;
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** Your API starting point. */
  "self": Graph;
  /** Various helpers used for determing valid property values. */
  "fx:property_helpers": FxPropertyHelpers.Graph;
  /** Reporting API home. */
  "fx:reporting": FxReporting.Graph;
  /** POST here to encode a body of html for use with our HMAC cart encryption. */
  "fx:encode": FxEncode.Graph;
  /** Your stores. */
  "fx:stores": FxStores.Graph;
  /** The current store for your authentication token. */
  "fx:store": FxStore.Graph;
  /** The OAuth endpoint for obtaining a new access_token using an existing refresh_token. POST `www-form-url-encoded` data as follows: `grant_type=refresh_token&refresh_token={refresh_token}&client_id={client_id}&client_secret={client_secret}`. */
  "fx:token": FxToken.Graph;
  /** Your API home page. */
  "fx:user": FxUser.Graph;
}

export interface Props {
  /** A small, human readable explanation of this resource. */
  message: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
