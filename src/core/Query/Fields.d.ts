import type { Graph } from '../Graph';
import type { With } from '../utils';

export type Fields<TGraph extends Graph> = TGraph extends With<Graph, 'props'>
  ? ReadonlyArray<keyof TGraph['props']>
  : never;
