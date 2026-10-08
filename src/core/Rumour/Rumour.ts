import type { CeaseCallback, Collection, Patch, Resource, Share, TrackCallback } from './types';
import { get, isEqual } from 'lodash';

import { UpdateError } from './UpdateError.js';
import traverse from 'traverse';

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

  private static __createPatch(data: Resource): Patch {
    return traverse(data).reduce(function (patch: Patch, value) {
      if (!Rumour.__isResource(value) || Rumour.__isCollection(value)) return patch;

      const props = traverse(value).map(function () {
        if (this.key === '_embedded') return this.delete(true);
      });

      patch.set(value._links.self.href, props);
      return patch;
    }, new Map());
  }

  private static __applyPatch(patch: Patch, data: Resource, related?: ReadonlyArray<string>) {
    const approximateRelatedURIs = related?.map(uri => Rumour.__approximateURI(uri)) ?? [];

    const result = traverse({ data }).map(function (node) {
      if (!Rumour.__isResource(node)) return;

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

        if (props) return this.update({ ...node, ...props }, true);
        if (!(this.parent as traverse.TraverseContext).parent) return this.delete(true);

        // Deleting an embedded resource may result in differences between server-side and client-side states.
        // For example, deleting a resource from a collection page shifts the content and changes some of the page fields.
        // At this point, Rumour is unable to perform such updates reliably, so it asks the data host to reload its state instead.
        throw new Rumour.UpdateError();
      }
    });

    return result.data ?? null;
  }
}
