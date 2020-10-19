import type * as FxReporting from "./reporting";
import type * as FxUser from "./user";

export type Rel = "reporting_email_exists";
export type Curie = "fx:reporting_email_exists";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Link to user resource for the requested email. */
  "fx:user": FxUser.Links;
  /** Reporting API home. */
  "fx:reporting": FxReporting.Links;
}

export interface Props {
  /** A small, human readable explanation of this resource. */
  message: string;
}

export type Zoom = never;
