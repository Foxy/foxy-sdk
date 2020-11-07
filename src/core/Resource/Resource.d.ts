import type { Embeds } from './Embeds';
import type { Graph } from '../Graph';
import type { Links } from './Links';
import type { Props } from './Props';
import type { Query } from '../Query';

/** Constructs a resource record for given graph node and query. */
export type Resource<TGraph extends Graph, TQuery extends Query<TGraph> | undefined> = Links<TGraph> &
  Props<TGraph, TQuery> &
  Embeds<TGraph, TQuery>;
