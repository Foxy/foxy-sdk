type Curie = "fx:create_session";
type Links = never;

interface Props {
  /** Unique session identifier. */
  session_id: string;
  /** URL of the cart associated with this session. */
  cart_link: string;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
