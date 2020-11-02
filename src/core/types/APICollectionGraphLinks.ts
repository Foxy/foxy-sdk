import { APIGraph } from './APIGraph';

export type APICollectionGraphLinks<TAPIGraph extends APIGraph> = {
  /** This collection. */
  self: TAPIGraph;
  /** First page of this collection. */
  first: TAPIGraph;
  /** Previous page of this collection. */
  prev: TAPIGraph;
  /** Next page of this collection. */
  next: TAPIGraph;
  /** Last page of this collection. */
  last: TAPIGraph;
};
