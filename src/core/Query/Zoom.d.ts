import type { OptionalKeyOf, With } from '../utils';
import type { Graph } from '../Graph';

type ZoomArray<TGraph extends Graph> = ReadonlyArray<ZoomString<TGraph> | ZoomRecord<TGraph>>;
type ZoomString<TGraph extends Graph> = OptionalKeyOf<TGraph['zooms']>;
type ZoomRecord<TGraph extends Graph> = {
  readonly [Key in ZoomString<TGraph>]?: Zoom<Required<TGraph['zooms']>[Key]>;
};

export type Zoom<TGraph extends Graph> = TGraph extends With<Graph, 'zooms'>
  ? ZoomString<TGraph> | ZoomRecord<TGraph> | ZoomArray<TGraph>
  : never;
