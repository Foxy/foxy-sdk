import { Graph } from './Graph';

export type CollectionGraphLinks<TGraph extends Graph> = {
  /** This collection. */
  self: TGraph;
  /** First page of this collection. */
  first: TGraph;
  /** Previous page of this collection. */
  prev: TGraph;
  /** Next page of this collection. */
  next: TGraph;
  /** Last page of this collection. */
  last: TGraph;
};

export type CollectionGraphProps = {
  /** Total number of resources in this collection. */
  total_items: number;
  /** Number of items returned with this response. */
  returned_items: number;
  /** Maximum allowed number of items for this query. */
  limit: number;
  /** Number of skipped items. */
  offset: number;
};
