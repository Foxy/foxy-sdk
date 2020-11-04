import { With, ZoomIn } from './utils';
import { APIGraph } from './APIGraph';
import { APINodeQuery } from './APINodeQuery';

/**
 * Zooms in on the given rel and constructs a type
 * extending `APINodeQueryZoom` for use in a query.
 */
export type APINodeQueryZoomOn<
  TAPIGraph extends APIGraph,
  TAPINodeQuery extends APINodeQuery<TAPIGraph> | undefined,
  TRel extends keyof TAPIGraph['zooms']
> = TAPINodeQuery extends With<APINodeQuery<TAPIGraph>, 'zoom'>
  ? ZoomIn<TAPINodeQuery['zoom'], TRel> extends APINodeQuery<Required<TAPIGraph['zooms']>[TRel]>['zoom']
    ? ZoomIn<TAPINodeQuery['zoom'], TRel>
    : never
  : never;
