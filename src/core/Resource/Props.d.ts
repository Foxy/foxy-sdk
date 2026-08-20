import type { Graph } from '../Graph';
import type { Query } from '../Query';
import type { With } from '../utils';

/** Constructs part of the resource record with all requested properties. */
export type Props<TGraph extends Graph, TQuery extends Query<TGraph> | undefined> = TGraph extends With<Graph, 'props'> // <----| If resource has props,
  ? TGraph extends With<Graph, 'child'> // <------------------------------------------------------------------------------------| and it's a collection,
    ? TGraph['props'] // <------------------------------------------------------------------------------------------------------| then include all props.
    : TQuery extends Query<TGraph> // <-----------------------------------------------------------------------------------------| Otherwise, if it's a single resource fetched with a custom query,
    ? TQuery['fields'] extends ReadonlyArray<infer Fields> // <-----------------------------------------------------------------| which happens to have a fields array,
      ? Pick<TGraph['props'], Extract<Fields, keyof TGraph['props']>> // <------------------------------------------------------| then include only selected props.
      : TGraph['props'] // <----------------------------------------------------------------------------------------------------| In case there's no restrictions on fields, include all of them;
    : TGraph['props'] // <------------------------------------------------------------------------------------------------------| and when there's no query, do the same.
  : unknown; // <---------------------------------------------------------------------------------------------------------------| Finally, include nothing for resources without props.
