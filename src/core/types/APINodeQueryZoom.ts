import { OptionalKeyOf, With } from './utils';
import { APIGraph } from './APIGraph';

type APINodeQueryZoomArray<G extends APIGraph> = ReadonlyArray<APINodeQueryZoomString<G> | APINodeQueryZoomRecord<G>>;
type APINodeQueryZoomString<G extends APIGraph> = OptionalKeyOf<G['zooms']>;
type APINodeQueryZoomRecord<G extends APIGraph> = {
  readonly [K in APINodeQueryZoomString<G>]?: APINodeQueryZoom<Required<G['zooms']>[K]>;
};

export type APINodeQueryZoom<G extends APIGraph> = G extends With<APIGraph, 'zooms'>
  ? APINodeQueryZoomString<G> | APINodeQueryZoomRecord<G> | APINodeQueryZoomArray<G>
  : never;
