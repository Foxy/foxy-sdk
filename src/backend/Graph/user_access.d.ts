import type { Graph } from '../../core';
import type { Store } from './store';
import type { User } from './user';

export interface UserAccess extends Graph {
  curie: 'fx:user_access';

  links: {
    /** This resource. */
    'self': UserAccess;
    /** Related user resource. */
    'fx:user': User;
    /** Related store resource. */
    'fx:store': Store;
  };

  props: {
    /** A full API URI of the user resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
    user_uri: string;
    /** A full API URI of the store resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
    store_uri: string;
    /** Set this to true to make this store the default store for this user. That means it will be the first store they see when the log in to the FoxyCart admin. */
    is_default_store: boolean;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
