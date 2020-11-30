import type { ReportingEmailExists } from './reporting_email_exists';
import type { ReportingStoreDomainExists } from './reporting_store_domain_exists';
import type { Graph } from '../../core';

export interface Reporting extends Graph {
  curie: 'fx:reporting';

  links: {
    /** This resource. */
    'self': Reporting;
    /** Send a GET with an `email` query parameter to see if an existing user exists for this email value. */
    'fx:reporting_email_exists': ReportingEmailExists;
    /** Send a GET with a `store_domain` query parameter to see if an existing store exists for this `store_domain` value. */
    'fx:reporting_store_domain_exists': ReportingStoreDomainExists;
  };

  props: {
    /** A small, human readable explanation of this resource. */
    message: string;
  };
}
