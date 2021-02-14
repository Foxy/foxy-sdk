import type { FollowableEmbeds } from './FollowableEmbeds';
import type { FollowableLinks } from './Links';
import type { Graph } from '../Graph';
import type { Props } from '../Resource/Props';
import type { Query } from '../Query';
import type { With } from '../utils';

type FollowableChildZoom<
  TGraph extends With<Graph, 'child'>,
  TQuery extends Query<TGraph> | undefined
> = TQuery extends With<Query<TGraph['child']>, 'zoom'> ? { zoom: TQuery['zoom'] } : unknown;

type FollowableChildFields<
  TGraph extends With<Graph, 'child'>,
  TQuery extends Query<TGraph> | undefined
> = TQuery extends With<Query<TGraph['child']>, 'fields'> ? { fields: TQuery['fields'] } : unknown;

type FollowableChildQuery<TGraph extends With<Graph, 'child'>, TQuery extends Query<TGraph> | undefined> = Record<
  string,
  unknown
> &
  FollowableChildZoom<TGraph, TQuery> &
  FollowableChildFields<TGraph, TQuery>;

/** Constructs a resource record for an embedded (child) graph node and query. */
export type FollowableChild<TGraph extends Graph, TQuery extends Query<TGraph> | undefined> = TGraph extends With<
  Graph,
  'child'
>
  ? ReadonlyArray<FollowableChild<TGraph['child'], FollowableChildQuery<TGraph, TQuery>>>
  : FollowableLinks<TGraph> & Props<TGraph, TQuery> & FollowableEmbeds<TGraph, TQuery>;
