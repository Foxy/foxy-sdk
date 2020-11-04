import type { Graph } from '../../core';

export interface FxCreateSession extends Graph {
  curie: 'fx:create_session';

  props: {
    /** Unique session identifier. */
    session_id: string;
    /** URL of the cart associated with this session. */
    cart_link: string;
  };
}
