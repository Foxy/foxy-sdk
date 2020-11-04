import { IntersectionValueOf, With } from './utils';
import { APIGraph } from './APIGraph';
import { APINodeQuery } from './APINodeQuery';
import { APINodeQueryZoomOn } from './APINodeQueryZoomOn';
import { APIResourceZooms } from './APIResourceZooms';
import { APIResponseNode } from '../APINode';

/** Constructs embed value type for a nested resource. */
type ResourceEmbedValue<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined,
  TZoomedRel extends keyof Required<TAPIGraph['zooms']>
> = Required<TAPIGraph['zooms']>[TZoomedRel] extends With<APIGraph, 'child'> // <--------------| When zooming on a collection,
  ? APIResponseNode<Required<TAPIGraph['zooms']>[TZoomedRel]['child'], TAPINodeQuery>[] // <---| resolve to array of `APIResponseNode`.
  : APIResponseNode<
      Required<TAPIGraph['zooms']>[TZoomedRel],
      Record<'zoom', APINodeQueryZoomOn<TAPIGraph, TAPINodeQuery, TZoomedRel>>
    >; // <------------------------------------------------------------------------------------| Otherwise zoom on this resource and resolve to a single `APIResponseNode` with modified query.

/** Constructs embeds record for a non-collection (single) resource. */
type ResourceEmbed<
  TAPIGraph extends With<APIGraph, 'zooms'>,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = IntersectionValueOf<
  {
    // <----------------------------------------------------------------------------------------------------------------------| For each embedded resource:
    [R in APIResourceZooms<TAPIGraph, TAPINodeQuery>]: Required<TAPIGraph['zooms']>[R] extends With<APIGraph, 'curie'> // <---| If zoomed resource has a curie,
      ? Record<Required<TAPIGraph['zooms']>[R]['curie'], ResourceEmbedValue<TAPIGraph, TAPINodeQuery, R>> // <----------------| add it to embeds according to rules in `ResourceEmbedValue`.
      : never; // <-----------------------------------------------------------------------------------------------------------| Otherwise exclude it from the output.
  }
>;

/** Constructs a type of response node embeds record containing the embedded content. */
export type APIResponseNodeEmbeds<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = TAPIGraph extends With<APIGraph, 'child' | 'curie'> // <--------------------------------| If this is a collection,
  ? Record<TAPIGraph['curie'], APIResponseNode<TAPIGraph['child'], TAPINodeQuery>[]> // <---| construct a record like `{ [curie]: APIResponseNode[] }`.
  : TAPIGraph extends With<APIGraph, 'zooms'> // <------------------------------------------| If this is a zoomable resource,
  ? ResourceEmbed<TAPIGraph, TAPINodeQuery> // <--------------------------------------------| construct an embeds record according to rules in `ResourceEmbed`.
  : undefined; // <-------------------------------------------------------------------------| In any other case resolve with `undefined`.
