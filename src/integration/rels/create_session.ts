import type { APIGraph } from '../../core/types';

export interface FxCreateSession extends APIGraph {
  curie: 'fx:create_session';

  props: {
    /** Unique session identifier. */
    session_id: string;
    /** URL of the cart associated with this session. */
    cart_link: string;
  };
}
