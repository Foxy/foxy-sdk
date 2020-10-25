import type * as FxReportingStoreDomainExists from "./reporting_store_domain_exists";
import type * as FxReportingEmailExists from "./reporting_email_exists";

export type Rel = "reporting";
export type Curie = "fx:reporting";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Send a GET with an `email` query parameter to see if an existing user exists for this email value. */
  "fx:reporting_email_exists": FxReportingEmailExists.Graph;
  /** Send a GET with a `store_domain` query parameter to see if an existing store exists for this `store_domain` value. */
  "fx:reporting_store_domain_exists": FxReportingStoreDomainExists.Graph;
}

export interface Props {
  /** A small, human readable explanation of this resource. */
  message: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
