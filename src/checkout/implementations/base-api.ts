import type { APIEventMap, APIJson } from '../types';

import { API } from '../api';

type DeepMutable<T> = T extends ReadonlyArray<infer U>
  ? DeepMutable<U>[]
  : T extends object
  ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
  : T;

export type MutableAPIJson = DeepMutable<APIJson>;

type EventName = keyof APIEventMap;
type EventWithDetailName = {
  [K in EventName]: APIEventMap[K] extends CustomEvent<unknown> ? K : never;
}[EventName];

type EventWithoutDetailName = Exclude<EventName, EventWithDetailName>;

type EventDetail<K extends EventName> = APIEventMap[K] extends CustomEvent<infer D> ? D : never;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function cloneApiJson(json: APIJson): MutableAPIJson {
  return deepClone(json) as MutableAPIJson;
}

export function toMutable<T>(value: T): DeepMutable<T> {
  return deepClone(value) as DeepMutable<T>;
}

export abstract class BaseCheckoutAPI extends API {
  #state: 'idle' | 'busy';
  #json: MutableAPIJson;

  constructor(initialJson: APIJson, initialState: 'idle' | 'busy' = 'idle') {
    super();
    this.#json = cloneApiJson(initialJson);
    this.#state = initialState;
  }

  get state(): 'idle' | 'busy' {
    return this.#state;
  }

  get json(): APIJson {
    return this.#json as APIJson;
  }

  protected setState(state: 'idle' | 'busy', emitUpdate = true): void {
    this.#state = state;

    if (emitUpdate) {
      this.dispatchEvent(new Event('update'));
    }
  }

  protected mutateJson(mutator: (json: MutableAPIJson) => void): void {
    mutator(this.#json);
    this.dispatchEvent(new Event('update'));
  }

  protected replaceJson(nextJson: APIJson): void {
    this.#json = cloneApiJson(nextJson);
    this.dispatchEvent(new Event('update'));
  }

  protected dispatchCancelable<K extends EventWithoutDetailName>(type: K): boolean;
  protected dispatchCancelable<K extends EventWithDetailName>(type: K, detail: EventDetail<K>): boolean;
  protected dispatchCancelable<K extends EventName>(type: K, detail?: EventDetail<K>): boolean {
    const event =
      detail === undefined
        ? new Event(type, { cancelable: true })
        : new CustomEvent(type, { cancelable: true, detail });

    return this.dispatchEvent(event);
  }

  protected addErrorMessage(message: string, context = 'sdk'): void {
    this.mutateJson(json => {
      json.messages.push({ context, message, level: 'error' });
    });
  }
}
