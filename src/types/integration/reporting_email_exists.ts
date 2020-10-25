import type * as FxReporting from "./reporting";
import type * as FxUser from "./user";

type Curie = "fx:reporting_email_exists";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Link to user resource for the requested email. */
  "fx:user": FxUser.Graph;
  /** Reporting API home. */
  "fx:reporting": FxReporting.Graph;
}

interface Props {
  /** A small, human readable explanation of this resource. */
  message: string;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
