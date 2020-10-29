import type { FxReportingStoreDomainExists } from './reporting_store_domain_exists';
import type { FxReportingEmailExists } from './reporting_email_exists';

export interface FxReporting {
  curie: 'fx:reporting';

  links: {
    /** This resource. */
    'self': FxReporting;
    /** Send a GET with an `email` query parameter to see if an existing user exists for this email value. */
    'fx:reporting_email_exists': FxReportingEmailExists;
    /** Send a GET with a `store_domain` query parameter to see if an existing store exists for this `store_domain` value. */
    'fx:reporting_store_domain_exists': FxReportingStoreDomainExists;
  };

  props: {
    /** A small, human readable explanation of this resource. */
    message: string;
  };
}
