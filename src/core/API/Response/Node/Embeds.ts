import type { IntersectionValueOf, With, ZoomOn } from '../../../utils';
import type { Graph } from '../../../Graph';
import type { Node } from './Node';
import type { Query } from '../../../Query';
import type { Zooms } from '../../../Resource/Zooms';

/** Constructs embed value type for a nested resource. */
type ResourceEmbedValue<
  TGraph extends Graph,
  TQuery extends Query<TGraph> | undefined,
  TZoomedRel extends keyof Required<TGraph['zooms']>
> = Required<TGraph['zooms']>[TZoomedRel] extends With<Graph, 'child'> // <--------------| When zooming on a collection,
  ? Node<Required<TGraph['zooms']>[TZoomedRel]['child'], TQuery>[] // <---| resolve to array of `APIResponseNode`.
  : Node<Required<TGraph['zooms']>[TZoomedRel], Record<'zoom', ZoomOn<TGraph, TQuery, TZoomedRel>>>; // <------------------------------------------------------------------------------------| Otherwise zoom on this resource and resolve to a single `APIResponseNode` with modified query.

/** Constructs embeds record for a non-collection (single) resource. */
type ResourceEmbed<TGraph extends With<Graph, 'zooms'>, TQuery extends Query<TGraph> | undefined> = IntersectionValueOf<
  {
    // <----------------------------------------------------------------------------------------------------------------------| For each embedded resource:
    [R in Zooms<TGraph, TQuery>]: Required<TGraph['zooms']>[R] extends With<Graph, 'curie'> // <---| If zoomed resource has a curie,
      ? Record<Required<TGraph['zooms']>[R]['curie'], ResourceEmbedValue<TGraph, TQuery, R>> // <----------------| add it to embeds according to rules in `ResourceEmbedValue`.
      : never; // <-----------------------------------------------------------------------------------------------------------| Otherwise exclude it from the output.
  }
>;

/** Constructs a type of response node embeds record containing the embedded content. */
export type Embeds<TGraph, TQuery extends Query<TGraph> | undefined> = TGraph extends With<Graph, 'child' | 'curie'> // <--------------------------------| If this is a collection,
  ? Record<TGraph['curie'], Node<TGraph['child'], TQuery>[]> // <---| construct a record like `{ [curie]: APIResponseNode[] }`.
  : TGraph extends With<Graph, 'zooms'> // <------------------------------------------| If this is a zoomable resource,
  ? ResourceEmbed<TGraph, TQuery> // <--------------------------------------------| construct an embeds record according to rules in `ResourceEmbed`.
  : undefined; // <-------------------------------------------------------------------------| In any other case resolve with `undefined`.
