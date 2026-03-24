import type { APIEventMap } from "./api-event-map";

export type Listener<TAPIEventMap extends keyof APIEventMap, TAPI> = (
  this: TAPI,
  event: APIEventMap[TAPIEventMap],
) => void;
