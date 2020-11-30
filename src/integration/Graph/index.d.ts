import type * as Core from '../../core';
import type { Encode } from './encode';
import type { PropertyHelpers } from './property_helpers';
import type { Reporting } from './reporting';
import type { Store } from './store';
import type { Stores } from './stores';
import type { Token } from './token';
import type { User } from './user';

export interface Graph extends Core.Graph {
  links: {
    /** Your API starting point. */
    'self': Graph;
    /** Various helpers used for determing valid property values. */
    'fx:property_helpers': PropertyHelpers;
    /** Reporting API home. */
    'fx:reporting': Reporting;
    /** POST here to encode a body of html for use with our HMAC cart encryption. */
    'fx:encode': Encode;
    /** Your stores. */
    'fx:stores': Stores;
    /** The current store for your authentication token. */
    'fx:store': Store;
    /** The OAuth endpoint for obtaining a new access_token using an existing refresh_token. POST `www-form-url-encoded` data as follows: `grant_type=refresh_token&refresh_token={refresh_token}&client_id={client_id}&client_secret={client_secret}`. */
    'fx:token': Token;
    /** Your API home page. */
    'fx:user': User;
  };

  props: {
    /** A small, human readable explanation of this resource. */
    message: string;
  };
}
