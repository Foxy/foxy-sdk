import type { FxStore } from './store';
import type { Graph } from '../../core';

export interface FxNativeIntegration extends Graph {
  curie: 'fx:native_integration';

  links: {
    /** This resource. */
    'self': FxNativeIntegration;
    /** Store this native integration is enabled on. */
    'fx:store': FxStore;
  };

  props: {
    /** The identifier string of this provider. */
    provider: string;
    /** A JSON string containing the configuration values and credentials for this native integration. */
    config: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
