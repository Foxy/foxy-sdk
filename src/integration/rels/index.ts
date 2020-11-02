import type { APIGraph } from '../../core/types';
import type { FxEncode } from './encode';
import type { FxPropertyHelpers } from './property_helpers';
import type { FxReporting } from './reporting';
import type { FxStore } from './store';
import type { FxStores } from './stores';
import type { FxToken } from './token';
import type { FxUser } from './user';

export interface IntegrationAPIGraph extends APIGraph {
  links: {
    /** Your API starting point. */
    'self': IntegrationAPIGraph;
    /** Various helpers used for determing valid property values. */
    'fx:property_helpers': FxPropertyHelpers;
    /** Reporting API home. */
    'fx:reporting': FxReporting;
    /** POST here to encode a body of html for use with our HMAC cart encryption. */
    'fx:encode': FxEncode;
    /** Your stores. */
    'fx:stores': FxStores;
    /** The current store for your authentication token. */
    'fx:store': FxStore;
    /** The OAuth endpoint for obtaining a new access_token using an existing refresh_token. POST `www-form-url-encoded` data as follows: `grant_type=refresh_token&refresh_token={refresh_token}&client_id={client_id}&client_secret={client_secret}`. */
    'fx:token': FxToken;
    /** Your API home page. */
    'fx:user': FxUser;
  };

  props: {
    /** A small, human readable explanation of this resource. */
    message: string;
  };
}
