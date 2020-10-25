import { Graph, Query, ResponseJSON } from "./types";

class APIResponse<G extends Graph, Q extends Query<G> | undefined = undefined> extends Response {
  // TODO: enhanced, followable JSON output
  // async data(): Promise<APIData<G, Q>> {
  //   return new APIData<G, Q>(await super.json());
  // }

  constructor({ body, status, headers, statusText }: Response) {
    super(body, { status, headers, statusText });
  }

  json(): Promise<ResponseJSON<G, Q>> {
    return super.json();
  }
}

export { APIResponse };
