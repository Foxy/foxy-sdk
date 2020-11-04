import { Node as BaseNode } from '../../Node';
import { Consola } from 'consola';
import { Embeds } from './Embeds';
import { Graph } from '../../../Graph';
import { Query } from '../../../Query';

/** Options of {@link APIResponseNode} constructor. */
type ResponseNodeInit = {
  /** Custom Fetch API implementation for making authenticated requests. */
  fetch: Window['fetch'];
  /** Resolver cache implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API). */
  cache: Storage;
  /** Shared [Consola](https://github.com/nuxt-contrib/consola) instance. */
  console: Consola;
  /** Response json. */
  json: any;
};

/**
 * Gets resource URL from response JSON if possible.
 *
 * @param json Response JSON.
 * @returns Resource URL (if found).
 */
function getSelfURL(json: any): URL {
  const href = json?._links?.self?.href;
  if (typeof href === 'string') return new URL(href);
  throw new Error('TODO'); // TODO
}

/**
 * Base class representing contents of the resource that were
 * received with API response either on demand or after creation, update or deletion.
 * You shouldn't need to create instances of this class unless you're
 * building a custom API client with our SDK.
 */
export class Node<TGraph extends Graph, TQuery = undefined> extends BaseNode<TGraph> {
  /** Embedded resources. Same as `json._embedded`, but enhanced with {@link APIResponseNode} features. */
  readonly embeds: Embeds<TGraph, TQuery>;

  /** Own properties of this resource (excluding `_links` and `_embedded`). */
  readonly props: TGraph['props'];

  constructor({ json, ...nodeInit }: ResponseNodeInit) {
    super({ ...nodeInit, path: [getSelfURL(json)] });

    this.embeds = Object.entries(json?._embedded ?? {}).reduce(
      (embeds, [embedCurie, embedJSON]) =>
        Object.assign(embeds, {
          [embedCurie]: Array.isArray(embedJSON)
            ? embedJSON.map(itemJSON => new Node({ ...nodeInit, json: itemJSON }))
            : new Node({ ...nodeInit, json: embedJSON }),
        }),
      {}
    ) as Embeds<TGraph, TQuery>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _embedded, _links, ...props } = json as Record<string, unknown>;
    this.props = props;
  }
}
