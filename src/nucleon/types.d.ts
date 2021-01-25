/* eslint-disable @typescript-eslint/no-explicit-any */

import { Resource } from './Element/machine/types';

export type Unexpose = () => void;

export type Collection = Resource & { _links: { first: { href: string } } };

export type ExposeInit<TResource = any> = {
  /**
   * Resource getter. When ElementAPI instance calls this function,
   * it must return the latest stored version of the resource.
   */
  get: () => TResource;

  /**
   * Resource setter. ElementAPI instance will call this function
   * with an updated version of the resource whenever it becomes available.
   */
  set: (value: TResource) => void;

  /**
   * If exposed resource is a collection, this function will be called whenever
   * a new resource is added to it via a POST request.
   */
  add: (value: unknown) => void;
};

export type APIInit = {
  base: URL;
  level?: number;
  group?: string;
  element: HTMLElement;
};

export type Patch = Map<string, Record<string, unknown> | null>;
