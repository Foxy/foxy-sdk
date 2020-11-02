import { IntersectionValueOf, With, ZoomIn } from './utils';
import { APIGraph } from './APIGraph';
import { APINodeQuery } from './APINodeQuery';
import { APIResourceChild } from './APIResourceChild';
import { APIResourceZooms } from './APIResourceZooms';

/** Constructs part of the resource record with the embedded content. */
export type APIResourceEmbeds<TAPIGraph extends APIGraph, TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined> = {
  /** Embedded resources. */
  _embedded: TAPIGraph extends With<APIGraph, 'child' | 'curie'> // <---------------------------------------------------| When given a collection with a curie,
    ? Record<TAPIGraph['curie'], APIResourceChild<TAPIGraph, TAPINodeQuery>> // <---------------------------------------| create a record like `{ [curie]: APIResponseJSONChild }`.
    : TAPIGraph extends With<APIGraph, 'zooms'> // <--------------------------------------------------------------------| If it's a single zoomable resource
    ? IntersectionValueOf<
        {
          [R in APIResourceZooms<TAPIGraph, TAPINodeQuery>]: Required<TAPIGraph['zooms']>[R] extends With<
            APIGraph,
            'curie'
          > // <--------------------------------------------------------------------------------------------------------| 1. For each zoomed rel that has a curie, create a record like `{ [curie]: APIResponseJSONChild }`.
            ? {
                [Curie in Required<TAPIGraph['zooms']>[R]['curie']]: APIResourceChild<
                  TAPIGraph['zooms'][R],
                  {
                    zoom: TAPINodeQuery extends With<APINodeQuery<TAPIGraph>, 'zoom'>
                      ? ZoomIn<TAPINodeQuery['zoom'], R> extends APINodeQuery<Required<TAPIGraph['zooms']>[R]>['zoom']
                        ? ZoomIn<TAPINodeQuery['zoom'], R>
                        : never
                      : never; // <-------------------------------------------------------------------------------------| Otherwise pass an empty query for further resolution.
                  }
                >;
              }
            : never;
        }
      >
    : never; // <-------------------------------------------------------------------------------------------------------| In any other case don't include any embedded resources at all.
};
