import type { Reporting } from './reporting';
import type { User } from './user';
import type { Graph } from '../../core';

export interface ReportingEmailExists extends Graph {
  curie: 'fx:reporting_email_exists';

  links: {
    /** This resource. */
    'self': ReportingEmailExists;
    /** Link to user resource for the requested email. */
    'fx:user': User;
    /** Reporting API home. */
    'fx:reporting': Reporting;
  };

  props: {
    /** A small, human readable explanation of this resource. */
    message: string;
  };
}
