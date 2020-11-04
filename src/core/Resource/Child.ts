import type { Embeds } from './Embeds';
import type { Graph } from '../Graph';
import type { Links } from './Links';
import type { Props } from './Props';
import type { Query } from '../Query';
import type { With } from '../utils';

type ChildZoom<TGraph extends With<Graph, 'child'>, TQuery extends Query<TGraph> | undefined> = TQuery extends With<
  Query<TGraph['child']>,
  'zoom'
>
  ? { zoom: TQuery['zoom'] }
  : unknown;

type ChildFields<TGraph extends With<Graph, 'child'>, TQuery extends Query<TGraph> | undefined> = TQuery extends With<
  Query<TGraph['child']>,
  'fields'
>
  ? { fields: TQuery['fields'] }
  : unknown;

type ChildQuery<TGraph extends With<Graph, 'child'>, TQuery extends Query<TGraph> | undefined> = Record<
  string,
  unknown
> &
  ChildZoom<TGraph, TQuery> &
  ChildFields<TGraph, TQuery>;

/** Constructs a resource record for an embedded (child) graph node and query. */
export type Child<TGraph extends Graph, TQuery extends Query<TGraph> | undefined> = TGraph extends With<Graph, 'child'>
  ? ReadonlyArray<Child<TGraph['child'], ChildQuery<TGraph, TQuery>>>
  : Links<TGraph> & Props<TGraph, TQuery> & Embeds<TGraph, TQuery>;
