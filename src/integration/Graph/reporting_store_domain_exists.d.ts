import type { FxReporting } from './reporting';
import type { FxStore } from './store';
import type { Graph } from '../../core';

export interface FxReportingStoreDomainExists extends Graph {
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
