import type { APIEventMap } from './APIEventMap';

export type Listener<TAPIEventMap extends keyof APIEventMap, TAPI> = (
  this: TAPI,
  event: APIEventMap[TAPIEventMap]
) => void;
