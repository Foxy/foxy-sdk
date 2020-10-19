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
  "self": Links;
  /** Various helpers used for determing valid property values. */
  "fx:property_helpers": FxPropertyHelpers.Links;
  /** Reporting API home. */
  "fx:reporting": FxReporting.Links;
  /** POST here to encode a body of html for use with our HMAC cart encryption. */
  "fx:encode": FxEncode.Links;
  /** Your stores. */
  "fx:stores": FxStores.Links;
  /** The current store for your authentication token. */
  "fx:store": FxStore.Links;
  /** The OAuth endpoint for obtaining a new access_token using an existing refresh_token. POST `www-form-url-encoded` data as follows: `grant_type=refresh_token&refresh_token={refresh_token}&client_id={client_id}&client_secret={client_secret}`. */
  "fx:token": FxToken.Links;
  /** Your API home page. */
  "fx:user": FxUser.Links;
}

export interface Props {
  /** A small, human readable explanation of this resource. */
  message: string;
}

export type Zoom = never;
