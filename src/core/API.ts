import consola, { Consola, LogLevel } from "consola";
import { APINode, Graph } from "./index";

interface APIParameters {
  fetch: Window["fetch"];
  cache: Storage;
  baseURL: URL;
  storage: Storage;
  logLevel?: LogLevel;
}

interface ResolverParameters {
  path: [URL, ...string[]];
  cache: Storage;
  fetch: Window["fetch"];
  console: Consola;
}

export class APIResolutionError extends Error {
  constructor(public readonly response: Response) {
    super();
  }
}

const createKey = (path: (string | URL)[]) => path.map((v) => v.toString()).join(" > ");

async function resolve({ path, cache, fetch, console }: ResolverParameters): Promise<URL> {
  if (path.length === 1) return path[0];

  const [baseURL, curie] = path;
  const key = createKey([baseURL, curie]);

  console.trace(`Trying to resolve ${key}...`);
  const cachedURL = cache.getItem(createKey([baseURL, curie]));

  if (cachedURL) {
    console.success(`Resolved ${key} to ${cachedURL.toString()} using cache.`);
    const reducedPath = [new URL(cachedURL), ...path.slice(2)] as [URL, ...string[]];
    return resolve({ path: reducedPath, cache, fetch, console });
  }

  const response = await fetch(baseURL.toString());

  if (response.ok) {
    const json = await response.json();
    const url = new URL(json._links[curie].href);
    const reducedPath = [url, ...path.slice(2)] as [URL, ...string[]];

    cache.setItem(key, url.toString());
    console.trace(`Cached ${url.toString()} for ${key}.`);
    console.success(`Resolved ${key} to ${url.toString()} online.`);

    return resolve({ path: reducedPath, cache, fetch, console });
  } else {
    console.error(`Failed to resolve ${key}.`);
    throw new APIResolutionError(response);
  }
}

export class API<TGraph extends Graph> extends APINode<TGraph> {
  readonly baseURL: URL;
  readonly storage: Storage;
  readonly console: Consola;

  constructor({ cache, fetch, storage, baseURL, logLevel }: APIParameters) {
    super({
      resolve: (path) => resolve({ path, fetch, cache, ...this }),
      fetch,
      path: [baseURL],
    });

    this.baseURL = baseURL;
    this.storage = storage;
    this.console = consola.create({ level: logLevel }).withTag("@foxy.io/api");
  }
}
