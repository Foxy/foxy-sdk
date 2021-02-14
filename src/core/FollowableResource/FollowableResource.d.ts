import type { Embeds } from '../Resource/Embeds';
import type { FollowableLinks } from './Links';
import type { Graph } from '../Graph';
import type { Props } from '../Resource/Props';
import type { Query } from '../Query';

/** Constructs a resource record for given graph node and query. */
export type FollowableResource<TGraph extends Graph, TQuery extends Query<TGraph> | undefined> = FollowableLinks<
  TGraph
> &
  Props<TGraph, TQuery> &
  Embeds<TGraph, TQuery>;
