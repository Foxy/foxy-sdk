import type { APIGraph } from './APIGraph';
import type { APINodeQueryFields } from './APINodeQueryFields';
import type { APINodeQueryOrder } from './APINodeQueryOrder';
import type { APINodeQueryZoom } from './APINodeQueryZoom';
import { With } from './utils';

export interface APINodeQuery<G extends APIGraph> {
  readonly zoom?: APINodeQueryZoom<G extends With<APIGraph, 'child'> ? G['child'] : G>;
  readonly order?: G extends With<APIGraph, 'child'> ? APINodeQueryOrder<G['child']> : never;
  readonly limit?: G extends With<APIGraph, 'child'> ? number : never;
  readonly fields?: APINodeQueryFields<G extends With<APIGraph, 'child'> ? G['child'] : G>;
  readonly offset?: G extends With<APIGraph, 'child'> ? number : never;
  readonly filters?: G extends With<APIGraph, 'child'> ? ReadonlyArray<string> : never;
}
