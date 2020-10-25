import type * as FxShippingContainer from "./shipping_container";

export type Rel = "shipping_containers";
export type Curie = "fx:shipping_containers";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This collection. */
  self: Graph;
  /** First page of this collection. */
  first: Graph;
  /** Previous page of this collection. */
  prev: Graph;
  /** Next page of this collection. */
  next: Graph;
  /** Last page of this collection. */
  last: Graph;
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

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  child: FxShippingContainer.Graph;
  zooms: Zooms;
}
