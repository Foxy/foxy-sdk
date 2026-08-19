import type { Fields } from './Fields';
import type { Graph } from '../Graph';
import type { Order } from './Order';
import type { With } from '../utils';
import type { Zoom } from './Zoom';

export interface Query<G extends Graph> {
  readonly zoom?: Zoom<G extends With<Graph, 'child'> ? G['child'] : G>;
  readonly order?: G extends With<Graph, 'child'> ? Order<G['child']> : never;
  readonly limit?: G extends With<Graph, 'child'> ? number : never;
  readonly fields?: Fields<G extends With<Graph, 'child'> ? G['child'] : G>;
  readonly offset?: G extends With<Graph, 'child'> ? number : never;
  readonly filters?: G extends With<Graph, 'child'> ? ReadonlyArray<string> : never;
}
