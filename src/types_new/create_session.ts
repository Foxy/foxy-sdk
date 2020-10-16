export type Rel = "create_session";
export type Curie = "fx:create_session";
export type Methods = "POST" | "OPTIONS";
export type Links = never;

export interface Props {
  /** Unique session identifier. */
  session_id: string;
  /** URL of the cart associated with this session. */
  cart_link: string;
}

export type Zoom = never;
