import type { Graph } from '../../core';
import type { Reporting } from './reporting';
import type { Store } from './store';

export interface ReportingStoreDomainExists extends Graph {
  curie: 'fx:reporting_store_domain_exists';

  links: {
    /** This resource. */
    'self': ReportingStoreDomainExists;
    /** Link to store for the requested domain. */
    'fx:store': Store;
    /** Reporting API home. */
    'fx:reporting': Reporting;
  };

  props: {
    /** A small, human readable explanation of this resource. */
    message: string;
  };
}
