import ow from "ow";
import { APIResponse } from "./APIResponse";
import { Curies, Follow, Graph, Properties, Query } from "./types";

interface APINodeParameters {
  path: string[];
  fetch: Window["fetch"];
  resolve: (path: string[]) => Promise<URL>;
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
  fields: ow.optional.array.ofType(ow.string),
  offset: ow.optional.number.integer.greaterThanOrEqual(0),
  limit: ow.optional.number.integer.greaterThanOrEqual(0),
  order: ow.any(ow.undefined, ow.string, isOrderRecord, isOrderArray),
  zoom: ow.any(ow.undefined, isZoom),
};

class APINode<G extends Graph> {
  protected _path: string[];
  protected _fetch: Window["fetch"];
  protected _resolve: (path: string[]) => Promise<URL>;

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
    const { fields, offset, limit, order, zoom } = query ?? {};

    if (fields !== undefined) url.searchParams.set("fields", fields.join(","));
    if (offset !== undefined) url.searchParams.set("offset", String(offset));
    if (limit !== undefined) url.searchParams.set("limit", String(limit));
    if (order !== undefined) url.searchParams.set("order", stringifyOrder(order));
    if (zoom !== undefined) url.searchParams.set("zoom", stringifyZoom("", zoom));

    return new APIResponse<G>(await this._fetch(new Request(url.toString())));
  }

  async put(body: Properties<G>): Promise<APIResponse<G>> {
    ow(body, ow.object);
    const url = await this._resolve(this._path);
    const request = new Request(url.toString(), { method: "PUT", body: JSON.stringify(body) });
    return new APIResponse<G>(await this._fetch(request));
  }

  async post(body?: Properties<G>): Promise<APIResponse<G>> {
    ow(body, ow.any(ow.undefined, ow.object));
    const url = await this._resolve(this._path);
    const request = new Request(url.toString(), { method: "POST", body: JSON.stringify(body) });
    return new APIResponse<G>(await this._fetch(request));
  }

  async patch(body: Partial<Properties<G>>): Promise<APIResponse<G>> {
    ow(body, ow.object);
    const url = await this._resolve(this._path);
    const request = new Request(url.toString(), { method: "POST", body: JSON.stringify(body) });
    return new APIResponse<G>(await this._fetch(request));
  }

  async delete(): Promise<APIResponse<G>> {
    const url = await this._resolve(this._path);
    const request = new Request(url.toString(), { method: "DELETE" });
    return new APIResponse<G>(await this._fetch(request));
  }

  follow<C extends Curies<G>>(curie: C): APINode<Follow<G, C>> {
    ow(curie as any, ow.string);
    return new APINode<Follow<G, C>>({
      resolve: this._resolve,
      fetch: this._fetch,
      path: this._path.concat(curie as string),
    });
  }
}

export { APINode };
