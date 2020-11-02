import { APIGraph } from './APIGraph';
import { APINodeQuery } from './APINodeQuery';
import { APIResourceEmbeds } from './APIResourceEmbeds';
import { APIResourceLinks } from './APIResourceLinks';
import { APIResourceProps } from './APIResourceProps';

/** Constructs a resource record for given graph node and query. */
export type APIResource<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = APIResourceLinks<TAPIGraph> &
  APIResourceProps<TAPIGraph, TAPINodeQuery> &
  APIResourceEmbeds<TAPIGraph, TAPINodeQuery>;
