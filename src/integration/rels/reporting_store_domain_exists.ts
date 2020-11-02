import type { APIGraph } from '../../core/types';
import type { FxReporting } from './reporting';
import type { FxStore } from './store';

export interface FxReportingStoreDomainExists extends APIGraph {
  curie: 'fx:reporting_store_domain_exists';

  links: {
    /** This resource. */
    'self': FxReportingStoreDomainExists;
    /** Link to store for the requested domain. */
    'fx:store': FxStore;
    /** Reporting API home. */
    'fx:reporting': FxReporting;
  };

  props: {
    /** A small, human readable explanation of this resource. */
    message: string;
  };
}
