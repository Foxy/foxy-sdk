import { APINode } from "./APINode";
import { Graph } from "./types";

interface APIParameters {
  fetch: Window["fetch"];
  baseURL: URL;
  storage: Storage;
}

interface ResolverParameters {
  path: string[];
  fetch: Window["fetch"];
  baseURL: URL;
  storage: Storage;
}

export class APIResolutionError extends Error {
  constructor(public readonly response: Response) {
    super();
  }
}

async function resolve({ baseURL: base, path, storage, fetch }: ResolverParameters): Promise<URL> {
  const createKey = (base: URL, path: string[]) => [base.toString(), ...path].join("|");

  let traversalPath = path;
  let parentJSON: any | null = null;
  let startURL = base;

  for (let i = path.length - 1; i >= 0; --i) {
    const cachedURL = storage.getItem(createKey(base, path.slice(0, i)));
    if (cachedURL) {
      traversalPath = path.slice(i + 1);
      startURL = new URL(cachedURL);
      break;
    }
  }

  for (let i = -1; i < traversalPath.length; ++i) {
    const url = new URL(parentJSON?._links.self.href ?? startURL);
    const key = createKey(base, traversalPath.slice(0, i + 1));
    const response = await fetch(url.toString());

    if (!response.ok) throw new APIResolutionError(response);
    if (i > -1) storage.setItem(key, url.toString());

    parentJSON = await response.json();
  }

  return parentJSON?._links.self.href ?? startURL;
}

export class API<TGraph extends Graph> extends APINode<TGraph> {
  readonly baseURL: URL;
  readonly storage: Storage;

  constructor(params: APIParameters) {
    super({
      resolve: (path) => resolve({ ...this, path, fetch }),
      path: [],
      fetch,
    });

    this.baseURL = params.baseURL;
    this.storage = params.storage;
  }
}
