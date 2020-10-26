import { APINodeParameters } from "./APINode";
import { APIResponseNode } from "./APIResponseNode";
import { Graph, Query, ResponseJSON } from "./types";

type APIResponseParameters = Omit<APINodeParameters, "path"> & { response: Response };

class APIResponse<G extends Graph, Q extends Query<G> | undefined = undefined> extends Response {
  protected _path: [URL, ...string[]];
  protected _fetch: Window["fetch"];
  protected _resolve: (path: [URL, ...string[]]) => Promise<URL>;

  constructor({ response, resolve, fetch }: APIResponseParameters) {
    super(response.body, response);

    this._resolve = resolve;
    this._fetch = fetch;
    this._path = [new URL(response.url)];
  }

  async node(): Promise<APIResponseNode<G, Q>> {
    const json = await super.json();
    return new APIResponseNode<G, Q>({ resolve: this._resolve, fetch: this._fetch, json });
  }

  json(): Promise<ResponseJSON<G, Q>> {
    return super.json();
  }
}

export { APIResponse };
