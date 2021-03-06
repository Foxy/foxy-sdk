import type { ExcludeNever, IntersectionValueOf, With, ZoomOn } from '../utils';
import type { Child } from './Child';
import type { Graph } from '../Graph';
import type { Query } from '../Query';
import type { Zooms } from './Zooms';

/**
 * For each zoomed rel that has a curie, creates a record
 * like `{ [curie]: APIResponseJSONChild }` and returns the intersection
 * of those records.
 */
type ResourceEmbed<TGraph extends With<Graph, 'zooms'>, TQuery extends Query<TGraph> | undefined> = IntersectionValueOf<
  {
    [Rel in Zooms<TGraph, TQuery>]: Required<TGraph['zooms']>[Rel] extends With<Graph, 'curie'>
      ? {
          [Curie in Required<TGraph['zooms']>[Rel]['curie']]: Child<
            Required<TGraph['zooms']>[Rel],
            Record<'zoom', ZoomOn<TGraph, TQuery, Rel>>
          >;
        }
      : never;
  }
>;

/** Constructs part of the resource record with the embedded content. */
export type Embeds<TGraph extends Graph, TQuery extends Query<TGraph> | undefined> = ExcludeNever<{
  /** Embedded resources. */
  _embedded: TGraph extends With<Graph, 'child' | 'curie'> // <----| When given a collection with a curie,
    ? Record<TGraph['curie'], Child<TGraph, TQuery>> // <----------| create a special record like `{ [collection_curie]: APIResourceChild }`.
    : TGraph extends With<Graph, 'zooms'> // <---------------------| If it's a single zoomable resource,
    ? ResourceEmbed<TGraph, TQuery> // <---------------------------| construct a regular zoom record like `{ [zoomed_curie]: APIResourceChild, ... }`.
    : never; // <--------------------------------------------------| In any other case remove the `_embedded` property from output.
}>;
