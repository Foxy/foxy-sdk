import ow from "ow";

import {
  APIResponse,
  Curies,
  Follow,
  Graph,
  Properties,
  Query,
  Flatten,
  IntersectionOfValues,
  RequiredPropertyOf,
  ResponseJSON,
  ZoomIn,
} from "./index";

export interface APINodeParameters {
  path: [URL, ...string[]];
  fetch: Window["fetch"];
  resolve: (path: [URL, ...string[]]) => Promise<URL>;
}

function stringifyZoom(prefix: string, zoom: any): string {
  const scope = prefix === "" ? "" : prefix + ":";

  if (typeof zoom === "string") return scope + zoom;
  if (Array.isArray(zoom)) return zoom.map((v) => stringifyZoom(prefix, v)).join();

  return Object.entries(zoom)
    .map(([key, value]) => stringifyZoom(scope + key, value))
    .join();
}

function stringifyOrder(order: any): string {
  if (typeof order === "string") return order;

  if (Array.isArray(order)) {
    return order.map((item) => stringifyOrder(item)).join();
  }

  return Object.entries(order)
    .map(([key, value]) => `${key} ${value}`)
    .join();
}

const isOrderRecord = ow.object.valuesOfType(ow.string.oneOf(["asc", "desc"]));
const isOrderArray = ow.array.ofType(ow.any(ow.string, isOrderRecord));
const isZoom = ow.any(ow.string, ow.array.is(validateZoomArray), ow.object.is(validateZoomRecord));

function validateZoomArray(zoom: any): zoom is unknown[] {
  return ow.isValid(zoom, ow.array.ofType(ow.any(ow.string, ow.object.is(validateZoomRecord))));
}

function validateZoomRecord(zoom: any): zoom is Record<string, unknown> {
  return ow.isValid(zoom, ow.object.valuesOfType(isZoom));
}

const isQuery = {
  filters: ow.optional.array.ofType(ow.string),
  fields: ow.optional.array.ofType(ow.string),
  offset: ow.optional.number.integer.greaterThanOrEqual(0),
  limit: ow.optional.number.integer.greaterThanOrEqual(0),
  order: ow.any(ow.undefined, ow.string, isOrderRecord, isOrderArray),
  zoom: ow.any(ow.undefined, isZoom),
};

export class APINode<G extends Graph> {
  protected _path: [URL, ...string[]];
  protected _fetch: Window["fetch"];
  protected _resolve: (path: [URL, ...string[]]) => Promise<URL>;

  constructor({ path, fetch, resolve }: APINodeParameters) {
    this._path = path;
    this._fetch = fetch;
    this._resolve = resolve;
  }

  async get(): Promise<APIResponse<G>>;
  async get<Q extends Query<G>>(query: Q): Promise<APIResponse<G, Q>>;
  async get(query?: any): Promise<any> {
    ow(query, ow.optional.object.partialShape(isQuery));

    const url = await this._resolve(this._path);
    const { filters, fields, offset, limit, order, zoom } = query ?? {};

    if (filters !== undefined) {
      filters.forEach((filter: string) => {
        const params = new URLSearchParams(filter);
        [...params.entries()].forEach(([key, value]) => url.searchParams.append(key, value));
      });
    }

    if (fields !== undefined) url.searchParams.set("fields", fields.join(","));
    if (offset !== undefined) url.searchParams.set("offset", String(offset));
    if (limit !== undefined) url.searchParams.set("limit", String(limit));
    if (order !== undefined) url.searchParams.set("order", stringifyOrder(order));
    if (zoom !== undefined) url.searchParams.set("zoom", stringifyZoom("", zoom));

    const response = await this._fetch(new Request(url.toString()));
    return new APIResponse({ resolve: this._resolve, fetch: this._fetch, response });
  }

  async put(body: Properties<G>): Promise<APIResponse<G>> {
    ow(body, ow.object);

    const url = await this._resolve(this._path);
    const request = new Request(url.toString(), { method: "PUT", body: JSON.stringify(body) });
    const response = await this._fetch(request);

    return new APIResponse<G>({ resolve: this._resolve, fetch: this._fetch, response });
  }

  async post(body?: Properties<G>): Promise<APIResponse<G>> {
    ow(body, ow.any(ow.undefined, ow.object));

    const url = await this._resolve(this._path);
    const request = new Request(url.toString(), { method: "POST", body: JSON.stringify(body) });
    const response = await this._fetch(request);

    return new APIResponse<G>({ resolve: this._resolve, fetch: this._fetch, response });
  }

  async patch(body: Partial<Properties<G>>): Promise<APIResponse<G>> {
    ow(body, ow.object);

    const url = await this._resolve(this._path);
    const request = new Request(url.toString(), { method: "POST", body: JSON.stringify(body) });
    const response = await this._fetch(request);

    return new APIResponse<G>({ resolve: this._resolve, fetch: this._fetch, response });
  }

  async delete(): Promise<APIResponse<G>> {
    const url = await this._resolve(this._path);
    const request = new Request(url.toString(), { method: "DELETE" });
    const response = await this._fetch(request);

    return new APIResponse<G>({ resolve: this._resolve, fetch: this._fetch, response });
  }

  follow<C extends Curies<G>>(curie: C): APINode<Follow<G, C>> {
    ow(curie as any, ow.string);

    return new APINode<Follow<G, C>>({
      resolve: this._resolve,
      fetch: this._fetch,
      path: this._path.concat(curie as string) as [URL, ...string[]],
    });
  }
}

type APIResponseNodeParameters<G extends Graph, Q> = Omit<APINodeParameters, "path"> & {
  json: ResponseJSON<G, Q>;
};

type ZoomedResponseNodes<G extends Graph, Q> = Q extends Query<G>
  ? IntersectionOfValues<
      {
        [TRel in Flatten<Q["zoom"]> | RequiredPropertyOf<G["zooms"]>]: Record<
          Required<G["zooms"]>[TRel]["curie"],
          Required<G["zooms"]>[TRel]["child"] extends Graph
            ? APIResponseNode<Required<G["zooms"]>[TRel]["child"], { zoom: ZoomIn<Q["zoom"], TRel> }>[]
            : APIResponseNode<Required<G["zooms"]>[TRel], { zoom: ZoomIn<Q["zoom"], TRel> }>
        >;
      }
    >
  : IntersectionOfValues<
      {
        [TRel in RequiredPropertyOf<G["zooms"]>]: Record<
          Required<G["zooms"]>[TRel]["curie"],
          Required<G["zooms"]>[TRel]["child"] extends Graph
            ? APIResponseNode<Required<G["zooms"]>[TRel]["child"]>[]
            : APIResponseNode<Required<G["zooms"]>[TRel]>
        >;
      }
    >;

type CollectionItems<G extends Graph, Q> = G["child"] extends Graph
  ? Record<G["curie"], APIResponseNode<G["child"], Q>[]>
  : unknown;

type Zoom<G extends Graph, Q = undefined> = G["child"] extends Graph
  ? CollectionItems<G, Q>
  : ZoomedResponseNodes<G, Q>;

export class APIResponseNode<G extends Graph, Q = undefined> extends APINode<G> {
  readonly embeds: Zoom<G, Q>;
  readonly props: G["props"];

  constructor({ resolve, fetch, json }: APIResponseNodeParameters<G, Q>) {
    super({ resolve, fetch, path: [new URL(json._links.self.href)] });

    this.embeds = Object.entries(json._embedded).reduce((p, [key, value]) => {
      return {
        ...p,
        [key]: Array.isArray(value)
          ? value.map((n) => new APIResponseNode({ resolve, fetch, json: n }))
          : new APIResponseNode({ resolve, fetch, json: value }),
      };
    }, {}) as Zoom<G, Q>;

    this.props = json;
  }
}
