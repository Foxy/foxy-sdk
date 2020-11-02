import type { APIGraph } from './APIGraph';
import { With } from './utils';

type APINodeQueryOrderRecord<P extends PropertyKey> = {
  readonly [K in P]?: APINodeQueryOrderDirection;
};

export enum APINodeQueryOrderDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export type APINodeQueryOrder<G extends APIGraph> = G extends With<APIGraph, 'props'>
  ?
      | keyof G['props']
      | ReadonlyArray<keyof G['props'] | APINodeQueryOrderRecord<keyof G['props']>>
      | APINodeQueryOrderRecord<keyof G['props']>
  : never;
