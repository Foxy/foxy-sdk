import { APIGraph } from './APIGraph';
import { APINodeQuery } from './APINodeQuery';
import { With } from './utils';

/** Constructs part of the resource record with all requested properties. */
export type APIResourceProps<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = TAPIGraph extends With<APIGraph, 'props'> // <--------------------------------| If resource has props,
  ? TAPIGraph extends With<APIGraph, 'child'> // <--------------------------------| and it's a collection,
    ? TAPIGraph['props'] // <-----------------------------------------------------| then include all props.
    : TAPINodeQuery extends APINodeQuery<TAPIGraph> // <--------------------------| Otherwise, if it's a single resource fetched with a custom query,
    ? TAPINodeQuery['fields'] extends ReadonlyArray<infer Fields> // <------------| which happens to have a fields array,
      ? Pick<TAPIGraph['props'], Extract<Fields, keyof TAPIGraph['props']>> // <--| then include only selected props.
      : TAPIGraph['props'] // <---------------------------------------------------| In case there's no restrictions on fields, include all of them;
    : TAPIGraph['props'] // <-----------------------------------------------------| and when there's no query, do the same.
  : unknown; // <-----------------------------------------------------------------| Finally, include nothing for resources without props
