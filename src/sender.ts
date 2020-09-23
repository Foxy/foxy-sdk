import traverse from "traverse";
import { Methods } from "./types/api/methods";
import { Auth } from "./auth/types";

import {
  HTTPMethod,
  HTTPMethodWithBody,
  ApiGraph,
  PathMember,
  ZoomUnion,
  NeverIfUndefined,
  Resource,
  Fields,
  Order,
} from "./types/utils";

import { Resolver } from "./resolver";
import { Props } from "./types/api/props";
import { ApiError } from "./error";

type SendBody<Host, Method> = Method extends HTTPMethodWithBody
  ? Host extends keyof Props
    ? Partial<Props[Host]>
    : any
  : never;

type SendMethod<Host> = Host extends keyof Methods ? Methods[Host] : HTTPMethod;

export interface SendRawInit<Host, Method = SendMethod<Host>> {
  /**
   * The absolute URL (either a `URL` instance or a string)
   * to send the request to. Required.
   */
  url: URL | string;

  /**
   * Request payload, either already serialized or in form of a serializable object.
   * Not applicable to some request methods (e.g. `GET`). Empty by default.
   */
  body?: SendBody<Host, Method> | string;

  /**
   * {@link https://developer.mozilla.org/docs/Web/HTTP/Methods HTTP method} to use in this request.
   * Different relations support different sets of methods. If omitted, `GET` will be used by default.
   */
  method?: Method;
}

export type SendInit<Host, Method = SendMethod<Host>> = Omit<SendRawInit<Host, Method>, "url"> & {
  /**
   * If true, all URL resolution optimizations will be disabled for this requests.
   * This option is `false` by default.
   */
  skipCache?: boolean;

  /**
   * An array of fields to include in the response object (aka partial resource).
   * Same as setting the `fields` query parameter. If you provide values in both `fields` and `query`,
   * they will be parsed, deduped and merged.
   */
  fields?: Fields<Host>;

  /**
   * A key-value map containing the query parameters that you'd like to add to the URL when it's resolved.
   * You can also use `URLSearchParams` if convenient. Empty set by default.
   */
  query?: URLSearchParams | Record<string, string>;

  /**
   * Zoomable resources to embed in the response. Pass a string literal
   * for a single resource, an array of string literals for multiple,
   * and an object for multi-level zooming. Just like in the raw query
   * parameter value, only bare relation names are supported (without the `fx` prefix and
   * the `https://api.foxycart.com/rels` path before the relation name).
   *
   * @see https://api.foxycart.com/docs/cheat-sheet ("Zooming" section).
   * @example
   *
   * // &zoom=transactions
   * { zoom: "transactions" }
   *
   * // &zoom=transactions,customer
   * { zoom: [ "transactions, customer" ] }
   *
   * // &zoom=customer:default_billing_address
   * { zoom: { customer: ["default_billing_address"] } }
   *
   * // &zoom=transactions,customer:default_billing_address
   * { zoom: [ "transactions", { customer: ["default_billing_address"] } ] }
   */
  zoom?: ZoomUnion<Host>;

  /**
   * You can adjust the sorting order of the collection response using this parameter.
   * Default direction is `asc` (ascending).
   *
   * @see https://api.foxycart.com/docs/cheat-sheet ("Sorting" section).
   * @example
   *
   * // &order=date_created
   * { order: "date_created" }
   *
   * // &order=date_created desc
   * { order: { date_created: "desc" } }
   *
   * // &order=date_created,transaction_date
   * { order: ["date_created", "transaction_date"] }
   *
   * // &order=date_created desc,transaction_date
   * { order: [ { date_created: "desc" }, "transaction_date"] }
   */
  order?: Order<Host>;

  /**
   * Out of the box, the API includes pagination links to move between pages of results via
   * the rels `first`, `prev`, `next` and `last`, but you can also control the number of results per page
   * with this parameter. The API returns 20 items per page by default,
   * and currently the maximum results per page is 300.
   */
  limit?: number;

  /**
   * Out of the box, the API includes pagination links to move between pages of results via
   * the rels `first`, `prev`, `next` and `last`, but you can also specify a starting offset for the results
   * with this parameter. The default value is 0.
   */
  offset?: number;
};

/**
 * Part of the API functionality that sends the API requests and
 * normalizes the responses if necessary.
 *
 * **IMPORTANT:** this class is internal; using it in consumers code is not recommended.
 */
export class Sender<
  Graph extends ApiGraph,
  Host extends PathMember,
  TAuth extends Auth
> extends Resolver<TAuth> {
  /**
   * Makes an API request to the specified URL, skipping the path construction
   * and resolution. This is what `.fetch()` uses under the hood. Before calling
   * this method, consider using a combination of `foxy.from(resource).fetch()`
   * or `foxy.follow(...).fetch()` instead.
   *
   * @example
   *
   * const response = await foxy.follow("fx:store").fetchRaw({
   *   url: "https://api.foxycart.com/stores/8",
   *   method: "POST",
   *   body: { ... }
   * });
   * @param init fetch-like request initializer supporting url, method and body params
   */
  async fetchRaw(params: SendRawInit<Host>): Promise<Resource<Graph, Host>> {
    const method = params.method ?? "GET";

    const url = new URL(
      String(params.url).startsWith("/") ? String(params.url).substring(1) : String(params.url),
      this._base
    );

    const response = await this._auth.fetch(url.toString(), {
      body: typeof params.body === "string" ? params.body : JSON.stringify(params.body),
      method,
    });

    this._logger.log({
      level: "http",
      message: `${method} ${url} [${response.status} ${response.statusText}]`,
    });

    if (!response.ok) throw new ApiError(await response.text(), response.status);

    return traverse(await response.json()).map(function (value: any) {
      // formats locales as "en-US" as opposed to "en_US"
      if (value && this.key === "locale_code") {
        return this.update(value.replace("_", "-"));
      }

      // formats timezone offset as "+03:00" as opposed to "+0300"
      if (value && this.key && this.key.split("_").includes("date")) {
        return this.update(value.replace(/([+-])(\d{2})(\d{2})$/gi, "$1$2:$3"));
      }
    });
  }

  /**
   * Resolves the resource URL and makes an API request
   * according to the given configuration. A GET request
   * without query parameters will be sent by default. Refer to our
   * {@link https://api.foxycart.com/docs/cheat-sheet cheatsheet}
   * for the list of available query parameters and HTTP methods.
   *
   * @example
   *
   * const { store_version } = await foxy.follow("fx:store").fetch({
   *   query: { fields: "store_version" }
   * });
   *
   * @param params API request options such as method, query or body
   */
  async fetch<T extends SendInit<Host>>(
    params?: T
  ): Promise<
    Resource<
      Graph,
      Host,
      NeverIfUndefined<T["fields"]>,
      T["fields"] extends any[] ? never : T["zoom"]
    >
  > {
    let url = new URL(await this.resolve(params?.skipCache));

    if (params?.query) {
      new URLSearchParams(params.query).forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }

    const queryFields = url.searchParams
      .getAll("fields")
      .map((v) => v.split(","))
      .reduce<string[]>((p, c) => p.concat(c), []);

    const paramsFields = (params?.fields ?? []) as string[];
    const mergedFields = [...new Set(queryFields.concat(paramsFields))];

    if (mergedFields.length > 0) {
      url.searchParams.set("fields", mergedFields.join(","));
    }

    if (params?.zoom) {
      url.searchParams.set("zoom", this._getZoomQueryValue("", params.zoom));
    }

    if (params?.limit) {
      url.searchParams.set("limit", params.limit.toFixed(0));
    }

    if (params?.offset) {
      url.searchParams.set("offset", params.offset.toFixed(0));
    }

    if (params?.order) {
      url.searchParams.set("order", this._getOrderQueryValue(params.order));
    }

    const rawParams: SendRawInit<Host> = { url };
    if (params?.body) rawParams.body = params.body;
    if (params?.method) rawParams.method = params.method;

    try {
      return (await this.fetchRaw({ ...rawParams })) as any;
    } catch (e) {
      if (!params?.skipCache && e.message.includes("No route found")) {
        this._logger.log({
          level: "error",
          message: "smart resolution failed, attempting tree traversal",
        });

        url = new URL(await this.resolve(true));
        return this.fetchRaw({ ...rawParams }) as any;
      } else {
        this._logger.log({ level: "error", message: e.message });
        throw e;
      }
    }
  }

  private _getZoomQueryValue(prefix: string, zoom: ZoomUnion<Host>): string {
    const scope = prefix === "" ? "" : prefix + ":";

    if (typeof zoom === "string") return scope + zoom;
    if (Array.isArray(zoom)) return zoom.map((v) => this._getZoomQueryValue(prefix, v)).join();

    return Object.entries(zoom)
      .map(([key, value]) => this._getZoomQueryValue(scope + key, value))
      .join();
  }

  private _getOrderQueryValue(order: Order<Host>): string {
    if (typeof order === "string") return order;

    if (Array.isArray(order)) {
      return order.map((item) => this._getOrderQueryValue(item)).join();
    }

    return Object.entries(order)
      .map(([key, value]) => `${key} ${value}`)
      .join();
  }
}
