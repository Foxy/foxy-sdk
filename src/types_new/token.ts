export type Rel = "token";
export type Curie = "fx:token";
export type Methods = "POST" | "OPTIONS";
export type Links = never;

export interface Props {
  /** The OAuth refresh token. This token is returned in the response whenever creating a client, user or store or when doing an authorization code grant. */
  refresh_token: string;
  /** The OAuth access token. Access tokens expire after 7200 seconds (2 hours). */
  access_token: string;
  /** Lifespan of the access token in seconds. */
  expires_in: number;
  /** Returned token type, e.g. `bearer`. */
  token_type: string;
  /** The scopes assigned to this token. */
  scope: string;
}

export type Zoom = never;
