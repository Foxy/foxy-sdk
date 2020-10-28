import { APINode, Graph } from "./index";

interface APIParameters {
  fetch: Window["fetch"];
  cache: Storage;
  baseURL: URL;
  storage: Storage;
}

interface ResolverParameters {
  path: [URL, ...string[]];
  cache: Storage;
  fetch: Window["fetch"];
}

export class APIResolutionError extends Error {
  constructor(public readonly response: Response) {
    super();
  }
}

async function resolve({ path, cache, fetch }: ResolverParameters): Promise<URL> {
  const createKey = (path: (string | URL)[]) => path.join("|");

  let traversalPath: (string | URL)[] = path;
  let parentJSON: any | null = null;
  let startURL = path[0];

  for (let i = path.length - 1; i >= 0; --i) {
    const cachedURL = cache.getItem(createKey(path.slice(0, i)));
    if (cachedURL) {
      traversalPath = path.slice(i + 1);
      startURL = new URL(cachedURL);
      break;
    }
  }

  for (let i = 0; i < traversalPath.length; ++i) {
    const url = new URL(parentJSON?._links[traversalPath[i].toString()].href ?? startURL);
    const response = await fetch(url.toString());

    if (!response.ok) throw new APIResolutionError(response);
    parentJSON = await response.json();

    if (i > 0) {
      const key = createKey(traversalPath.slice(0, i + 1));
      cache.setItem(key, url.toString());
    }
  }

  return new URL(parentJSON?._links.self.href ?? startURL);
}

export class API<TGraph extends Graph> extends APINode<TGraph> {
  readonly baseURL: URL;
  readonly storage: Storage;

  constructor({ cache, fetch, storage, baseURL }: APIParameters) {
    super({
      resolve: (path) => resolve({ path, fetch, cache }),
      fetch,
      path: [baseURL],
    });

    this.baseURL = baseURL;
    this.storage = storage;
  }
}
