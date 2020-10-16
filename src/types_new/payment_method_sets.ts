export type Rel = "payment_method_sets";
export type Curie = "fx:payment_method_sets";
export type Methods = "GET" | "POST" | "HEAD" | "OPTIONS";

export interface Links {
  /** This collection. */
  self: Links;
  /** First page of this collection. */
  first: Links;
  /** Previous page of this collection. */
  prev: Links;
  /** Next page of this collection. */
  next: Links;
  /** Last page of this collection. */
  last: Links;
}

export interface Props {
  /** Total number of resources in this collection. */
  total_items: number;
  /** Number of items returned with this response. */
  returned_items: number;
  /** Maximum allowed number of items for this query. */
  limit: number;
  /** Number of skipped items. */
  offset: number;
}

export type Zoom = never;
