/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsdoc/require-jsdoc */

import { Collection, Patch } from './types';
import traverse, { TraverseContext } from 'traverse';

import { Resource } from './Element/machine/types';

export function isResource(json: any): json is Resource {
  return typeof json?._links?.self?.href === 'string';
}

export function isCollection(json: any): json is Collection {
  return typeof json?._links?.first?.href === 'string';
}

export function getPatchKey(resource: Resource): string {
  const url = new URL(resource._links.self.href);

  if (isCollection(resource)) {
    if (url.searchParams.get('offset') === '0') url.searchParams.delete('offset');
    if (url.searchParams.get('limit') === '20') url.searchParams.delete('limit');
  } else {
    url.search = '';
  }

  url.hash = '';

  return url.toString();
}

export function getResourceProps(resource: Resource): Partial<Resource> {
  return traverse(resource).map(function () {
    if (this.key?.startsWith('_')) this.delete();
  });
}

export function toResourceWithHref<T extends Resource>(href: string) {
  return function (this: TraverseContext, accumulator: T | null, value: unknown): T | null {
    if (isResource(value) && value._links.self.href === href) {
      this.stop();
      return value as T;
    }

    return accumulator;
  };
}

export function applyPatch(patch: Patch) {
  return function (this: TraverseContext, value: unknown): void {
    if (isResource(value)) {
      const key = getPatchKey(value);

      if (patch.has(key)) {
        const props = patch.get(key);

        if (props === null) {
          this.delete(true);
        } else {
          this.update({ ...value, ...props }, true);
        }
      }
    }
  };
}

export function toPatch(this: TraverseContext, accumulator: Patch, value: unknown): Patch {
  if (isResource(value)) accumulator.set(getPatchKey(value), getResourceProps(value));
  return accumulator;
}
