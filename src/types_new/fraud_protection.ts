import type * as FxPaymentMethodSets from "./payment_method_sets";
import type * as FxStore from "./store";

export type Rel = "fraud_protection";
export type Curie = "fx:fraud_protection";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Store this fraud protection policy was set on. */
  "fx:store": FxStore.Links;
  /** Payment method sets these fraud protection measures are enabled on. */
  "fx:payment_method_sets": FxPaymentMethodSets.Links;
}

export interface Props {
  /** The type of this fraud protection */
  type: "minfraud" | "google_recaptcha" | "custom_precheckout_hook";
  /** Description of this fraud protection */
  description: string;
  /** Configuration settings for some fraud protection systems. */
  json: string;
  /** The score threshold used for minfraud. This should be set between 0 and 100. 0 will disable minFraud and 100 will turn it on for logging but still allow all transactions to go through. */
  score_threshold_reject: number;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
