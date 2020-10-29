export interface FxCreateSession {
  curie: 'fx:create_session';
  links: never;
  props: {
    /** Unique session identifier. */
    session_id: string;
    /** URL of the cart associated with this session. */
    cart_link: string;
  };
}
