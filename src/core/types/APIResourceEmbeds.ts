import { ExcludeNever, IntersectionValueOf, With, ZoomIn } from './utils';
import { APIGraph } from './APIGraph';
import { APINodeQuery } from './APINodeQuery';
import { APIResourceChild } from './APIResourceChild';
import { APIResourceZooms } from './APIResourceZooms';

/**
 * Zooms in on the given rel and constructs a type
 * extending `APINodeQueryZoom` for use in a query.
 */
type NestedZoom<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined,
  TRel extends keyof TAPIGraph['zooms']
> = TAPINodeQuery extends With<APINodeQuery<TAPIGraph>, 'zoom'>
  ? ZoomIn<TAPINodeQuery['zoom'], TRel> extends APINodeQuery<Required<TAPIGraph['zooms']>[TRel]>['zoom']
    ? ZoomIn<TAPINodeQuery['zoom'], TRel>
    : never
  : never;

/**
 * For each zoomed rel that has a curie, creates a record
 * like `{ [curie]: APIResponseJSONChild }` and returns the intersection
 * of those records.
 */
type ResourceEmbed<
  TAPIGraph extends With<APIGraph, 'zooms'>,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = IntersectionValueOf<
  {
    [R in APIResourceZooms<TAPIGraph, TAPINodeQuery>]: Required<TAPIGraph['zooms']>[R] extends With<APIGraph, 'curie'>
      ? {
          [Curie in Required<TAPIGraph['zooms']>[R]['curie']]: APIResourceChild<
            Required<TAPIGraph['zooms']>[R],
            Record<'zoom', NestedZoom<TAPIGraph, TAPINodeQuery, R>>
          >;
        }
      : never;
  }
>;

/** Constructs part of the resource record with the embedded content. */
export type APIResourceEmbeds<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined
> = ExcludeNever<{
  /** Embedded resources. */
  _embedded: TAPIGraph extends With<APIGraph, 'child' | 'curie'> // <---------------| When given a collection with a curie,
    ? Record<TAPIGraph['curie'], APIResourceChild<TAPIGraph, TAPINodeQuery>> // <---| create a special record like `{ [collection_curie]: APIResourceChild }`.
    : TAPIGraph extends With<APIGraph, 'zooms'> // <--------------------------------| If it's a single zoomable resource,
    ? ResourceEmbed<TAPIGraph, TAPINodeQuery> // <----------------------------------| construct a regular zoom record like `{ [zoomed_curie]: APIResourceChild, ... }`.
    : never; // <-------------------------------------------------------------------| In any other case remove the `_embedded` property from output.
}>;
