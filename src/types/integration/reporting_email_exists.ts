import type { FxReporting } from "./reporting";
import type { FxUser } from "./user";

export interface FxReportingEmailExists {
  curie: "fx:reporting_email_exists";

  links: {
    /** This resource. */
    "self": FxReportingEmailExists;
    /** Link to user resource for the requested email. */
    "fx:user": FxUser;
    /** Reporting API home. */
    "fx:reporting": FxReporting;
  };

  props: {
    /** A small, human readable explanation of this resource. */
    message: string;
  };
}
