import type * as FxTransactionLog from "./transaction_log";
import type * as FxStore from "./store";

export type Rel = "transaction_log_detail";
export type Curie = "fx:transaction_log_detail";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Relared store resource. */
  "fx:store": FxStore.Links;
  /** Related transaction log resource. */
  "fx:transaction_log": FxTransactionLog.Links;
}

export interface Props {
  /** A text representation of the type of request this log entry is for such as `item_edit`. */
  request_type: string;
  /** A reference id of some kind to help describe which resource this log entry refers to. */
  reference: string;
  /** The details of the changes for this log in JSON format. */
  log: string;
}

export type Zoom = never;
