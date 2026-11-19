import type { CeaseCallback, Collection, Patch, Resource, Share, TrackCallback } from './types';
import { clone, get, isEqual } from 'lodash';

import { UpdateError } from './UpdateError.js';

/**
 * Rumour is a schemaless state manager for `application/hal+json` resources.
 *
 * Unlike many other state managers, Rumour neither stores a global state nor
 * knows its structure – instead it links multiple local HAL+JSON states together
 * and keeps them in sync.
 *
 * To get started, subscribe your local state to Rumour updates using
 * the `.track()` method, and then subscribe Rumour to the local state updates
 * using the `.share()` method. Rumour will run the callback function passed to `.track()`
 * whenever an update becomes available, and if that update applies to your local state,
 * Rumour will recursively patch it on demand when you invoke `ctx.update()` from the callback.
 *
 * If you no longer need to receive updates, remember to unsubscribe
 * to avoid memory leaks (see `.track()` docs for more info).
 *
 * All updates are scoped to a Rumour instance, so if you share a resource to an
 * instance, only its own trackers will be notified.
 */
export class Rumour {
  /** Error thrown when there isn't enough data to update local state automatically. */
  static readonly UpdateError = UpdateError;

  private __callbacks: TrackCallback[] = [];

  /**
   * Extracts updates from the given resource and sends them to the
   * appropriate listeners.
   *
   * ```
   * // on creation
   * rumour.share({
   *   related: ['https://example.com/foos'], // collection URI
   *   source: 'https://example.com/foos/0',
   *   data: { foo: 'bar' },
   * });
   *
   * // on update
   * rumour.share({
   *   source: 'https://example.com/foos/0',
   *   data: { foo: 'bar' }
   * });
   *
   * // on deletion
   * rumour.share({
   *   source: 'https://example.com/foos/0',
   *   data: null
   * });
   * ```
   *
   * @param params Resource metadata and contents.
   */
  share<T extends Resource = Resource>(params: Share<T>): void {
    const { related, source, data } = params;
    const patch = data === null ? new Map([[source, null]]) : Rumour.__createPatch(data);

    [...this.__callbacks].forEach(callback => {
      callback(oldData => {
        const newData = Rumour.__applyPatch(patch, oldData, related);
        return isEqual(oldData, newData) ? oldData : newData;
      });
    });
  }

  /**
   * Subscribes to updates, returning a function that you can call
   * later to unsubscribe. Note that your listener will be notified of
   * every update, even if it doesn't apply to your resource – be sure to call
   * the update function provided as the first argument of the callback to see if
   * there are any changes.
   *
   * ```
   * const unsubscribe = rumour.track(update => {
   *   try {
   *     const newResource = update(oldResource);
   *     if (oldResource !== newResource) renderView(newResource);
   *   } catch {
   *     if (err instanceof Rumour.UpdateError) reloadFromServer();
   *   }
   * });
   *
   * // later in your code when you no longer need Rumour:
   * unsubscribe();
   * ```
   *
   * @param callback Function that will be called on every update.
   * @returns Function that you can call to unsubscribe from updates.
   */
  track(callback: TrackCallback): CeaseCallback {
    this.__callbacks.push(callback);
    return () => void this.__callbacks.splice(this.__callbacks.indexOf(callback), 1);
  }

  /** Removes all update listeners. */
  cease(): void {
    this.__callbacks.length = 0;
  }

  private static __isCollection(json: unknown): json is Collection {
    return typeof get(json, '_links.first.href') === 'string';
  }

  private static __isResource(json: unknown): json is Resource {
    return typeof get(json, '_links.self.href') === 'string';
  }

  private static __approximateURI(href: string): string {
    try {
      const url = new URL(href);
      url.search = '';
      url.hash = '';
      return url.toString();
    } catch {
      return href;
    }
  }

  /**
   * Calls `callback` for `value` and every object nested in it, parents first.
   * Circular references are passed to `callback` but not walked into.
   *
   * @param value Value to walk.
   * @param callback Function to call for each object.
   * @param ancestors Objects on the path to `value`.
   */
  private static __forEachObject(
    value: unknown,
    callback: (node: Record<string, unknown>) => void,
    ancestors: unknown[] = []
  ): void {
    if (typeof value !== 'object' || value === null) return;
    callback(value as Record<string, unknown>);
    if (ancestors.includes(value)) return;

    ancestors.push(value);
    Object.values(value as Record<string, unknown>).forEach(child => {
      Rumour.__forEachObject(child, callback, ancestors);
    });
    ancestors.pop();
  }

  /**
   * Returns a deep copy of `value` without `_embedded` keys at any depth.
   * Circular references are copied one level deep but not walked into.
   *
   * @param value Value to copy.
   * @param ancestors Objects on the path to `value`.
   * @returns Copy of `value`.
   */
  private static __copyWithoutEmbeds(value: unknown, ancestors: unknown[] = []): unknown {
    if (typeof value !== 'object' || value === null) return value;

    const copy = clone(value) as Record<string, unknown>;
    if (ancestors.includes(value)) return copy;

    delete copy._embedded;
    ancestors.push(value);
    for (const key of Object.keys(copy)) copy[key] = Rumour.__copyWithoutEmbeds(copy[key], ancestors);
    ancestors.pop();
    return copy;
  }

  private static __createPatch(data: Resource): Patch {
    const patch: Patch = new Map();

    Rumour.__forEachObject(data, node => {
      if (!Rumour.__isResource(node) || Rumour.__isCollection(node)) return;
      patch.set(node._links.self.href, Rumour.__copyWithoutEmbeds(node) as Record<string, unknown>);
    });

    return patch;
  }

  private static __applyPatch<T extends Resource>(patch: Patch, data: T, related?: ReadonlyArray<string>) {
    const approximateRelatedURIs = related?.map(uri => Rumour.__approximateURI(uri)) ?? [];

    const ancestors: unknown[] = [];
    const visit = (node: unknown, isRoot: boolean): unknown => {
      if (typeof node !== 'object' || node === null) return node;

      if (Rumour.__isResource(node)) {
        const exactURI = node._links.self.href;
        const approximateURI = Rumour.__approximateURI(exactURI);

        // This resource was referenced in the `related` array and is considered to be somehow affected by the update.
        // An error is usually thrown here if a resource is added to a collection – Rumour can't know for sure
        // where to insert the new resource in a collection page, so it asks the data host to reload its state.
        if (approximateRelatedURIs.includes(approximateURI)) throw new Rumour.UpdateError();

        if (patch.has(exactURI)) {
          const props = patch.get(exactURI);

          // When props ending with `_uri` or `_id` change, it's possible that the embedded content
          // will change as well, so we throw an error to ask the data host to reload its state.
          if (props) {
            for (const key in props) {
              if (!key.endsWith('_uri') && !key.endsWith('_id')) continue;
              if ((node as Record<string, unknown>)[key] === props[key]) continue;
              throw new Rumour.UpdateError();
            }
          }

          // Updated nodes are not walked further, so their own `_embedded` content stays as is.
          if (props) return { ...node, ...props };
          if (isRoot) return null;

          // Deleting an embedded resource may result in differences between server-side and client-side states.
          // For example, deleting a resource from a collection page shifts the content and changes some of the page fields.
          // At this point, Rumour is unable to perform such updates reliably, so it asks the data host to reload its state instead.
          throw new Rumour.UpdateError();
        }
      }

      // Each visited object is copied one level deep, so the input is never mutated and
      // objects below an updated resource keep their references (consumers may compare them with `===`).
      // Circular references are copied but not walked into.
      const copy = clone(node) as Record<string, unknown>;
      if (ancestors.includes(node)) return copy;

      ancestors.push(node);
      for (const key of Object.keys(copy)) copy[key] = visit(copy[key], false);
      ancestors.pop();
      return copy;
    };

    return (visit(data, true) ?? null) as T | null;
  }
}
