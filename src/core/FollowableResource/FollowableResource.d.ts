import type { FollowableEmbeds } from './FollowableEmbeds';
import type { FollowableLinks } from './FollowableLinks';
import type { Graph } from '../Graph';
import type { Props } from '../Resource/Props';
import type { Query } from '../Query';

/** Constructs a resource record for given graph node and query. */
export type FollowableResource<
  TGraph extends Graph,
  TQuery extends Query<TGraph> | undefined = undefined
> = FollowableLinks<TGraph> & Props<TGraph, TQuery> & FollowableEmbeds<TGraph, TQuery>;
