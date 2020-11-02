import { APIGraph } from './APIGraph';
import { With } from './utils';

export type APINodeQueryFields<G extends APIGraph> = G extends With<APIGraph, 'props'>
  ? ReadonlyArray<keyof G['props']>
  : never;
