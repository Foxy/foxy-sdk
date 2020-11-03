import { APIGraph } from './APIGraph';
import { APINodeQuery } from './APINodeQuery';
import { APIResourceEmbeds } from './APIResourceEmbeds';
import { APIResourceLinks } from './APIResourceLinks';
import { APIResourceProps } from './APIResourceProps';
import { With } from './utils';

type ChildZoom<
  TAPIGraph extends With<APIGraph, 'child'>,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = TAPINodeQuery extends With<APINodeQuery<TAPIGraph['child']>, 'zoom'> ? { zoom: TAPINodeQuery['zoom'] } : unknown;

type ChildFields<
  TAPIGraph extends With<APIGraph, 'child'>,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = TAPINodeQuery extends With<APINodeQuery<TAPIGraph['child']>, 'fields'>
  ? { fields: TAPINodeQuery['fields'] }
  : unknown;

type ChildQuery<
  TAPIGraph extends With<APIGraph, 'child'>,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = Record<string, unknown> & ChildZoom<TAPIGraph, TAPINodeQuery> & ChildFields<TAPIGraph, TAPINodeQuery>;

/** Constructs a resource record for an embedded (child) graph node and query. */
export type APIResourceChild<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = TAPIGraph extends With<APIGraph, 'child'>
  ? ReadonlyArray<APIResourceChild<TAPIGraph['child'], ChildQuery<TAPIGraph, TAPINodeQuery>>>
  : APIResourceLinks<TAPIGraph> &
      APIResourceProps<TAPIGraph, TAPINodeQuery> &
      APIResourceEmbeds<TAPIGraph, TAPINodeQuery>;
