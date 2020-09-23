import MemoryStorage from "ministorage";
import { FOXY_API_URL } from "./env";
import { PathMember } from "./types/utils";
import { Auth } from "./auth/types";
import { Collections, collections } from "./types/api/collections";

const throwIfEmpty = (value: any) => {
  if (!value) throw void 0;
  return value;
};

export class ResolverResolutionError extends Error {
  constructor(path: PathMember[], originalError: Error) {
    super(
      `URL resolution failed for the following path: ${path.join(" => ")}.\n` +
        `Details: ${originalError.message}.`
    );
  }
}

/**
 * Part of the API functionality that restores full URLs from
 * the ordered relations lists trying to make as few requests as possible.
 *
 * **IMPORTANT:** this class is internal; using it in consumers code is not recommended.
 */
export class Resolver<TAuth extends Auth> {
  protected _logger = {
    log(data: any) {
      console.log(data);
    },
  };

  constructor(
    protected _auth: TAuth,
    protected _path: PathMember[] = [],
    protected _base = FOXY_API_URL,
    protected _storage: Storage = new MemoryStorage()
  ) {}

  private get _apiUrl() {
    return new URL(this._base).origin;
  }

  private async _cacheIdentifiers(url: string) {
    const queue: Promise<any>[] = [];

    const user = url.match(/\.\w+\/users\/(\d+)/i)?.[1];
    const store = url.match(/\.\w+\/stores\/(\d+)/i)?.[1];

    if (user) {
      queue.push(this._storage.set("fx_resolver_user", user));
      this._logger.log({ level: "debug", message: `user ${user} has been set as default` });
    }

    if (store) {
      queue.push(this._storage.set("fx_resolver_store", store));
      this._logger.log({ level: "debug", message: `store ${store} has been set as default` });
    }

    await Promise.all(queue);
  }

  private async _traverse(baseUrl: string, rel: PathMember, path: PathMember[]) {
    const response = await this._auth.fetch(baseUrl);

    this._logger.log({
      level: "http",
      message: `GET ${baseUrl} [${response.status} ${response.statusText}]`,
    });

    if (!response.ok) throw new Error(await response.text());

    const resource = await response.json();
    const result = resource._links[rel].href as string;

    this._logger.log({ level: "debug", message: `resolved online: ${result}` });
    await this._cacheIdentifiers(result);

    return result;
  }

  private async _tryIdResolver(baseUrl: string, rel: PathMember, path: PathMember[]) {
    if (typeof rel !== "number") throw void 0;

    let previousCurie = path[path.length - 1] as PathMember | undefined;
    let result = "";

    if (previousCurie === "fx:attributes") {
      const parentPath = path.reverse().slice(1);
      const parentCurie = parentPath.find((v) => typeof v === "string") as
        | keyof Collections
        | undefined;

      previousCurie = collections[parentCurie as keyof Collections] ?? parentCurie;
      previousCurie = `${previousCurie}_attributes`;
    }

    if (typeof previousCurie === "string" && previousCurie.startsWith("fx:")) {
      result = `${this._apiUrl}/${previousCurie.substring(3)}/${rel}`;
    } else {
      result = `${baseUrl}/${rel}`;
    }

    this._logger.log({ level: "debug", message: `resolved offline: ${result}` });
    return result;
  }

  private async _tryStaticResolver(baseUrl: string, rel: PathMember, path: PathMember[]) {
    let result: string;

    switch (rel) {
      case "self":
        result = baseUrl;
        break;

      case "first":
        const parsedUrl = new URL(baseUrl);
        parsedUrl.searchParams.set("offset", "0");
        result = parsedUrl.toString();
        break;

      case "https://api.foxycart.com/rels":
        result = `${this._apiUrl}/rels`;
        break;

      case "fx:attributes":
        result = `${baseUrl}/attributes`;
        break;

      case "fx:property_helpers":
      case "fx:reporting":
      case "fx:encode":
      case "fx:token":
        result = `${this._apiUrl}/${rel.substring(3)}`;
        break;

      default:
        throw void 0;
    }

    this._logger.log({ level: "debug", message: `resolved offline: ${result}` });
    return result;
  }

  private async _tryCacheResolver(baseUrl: string, rel: PathMember, path: PathMember[]) {
    const whenGotStore = this._storage.get("fx_resolver_store");
    const whenGotUser = this._storage.get("fx_resolver_user");

    let result: string;

    switch (rel) {
      case "fx:user":
        result = `${this._apiUrl}/users/${await throwIfEmpty(whenGotUser)}`;
        break;

      case "fx:stores":
        result = `${this._apiUrl}/users/${await throwIfEmpty(whenGotUser)}/stores`;
        break;

      case "fx:store":
        result = `${this._apiUrl}/stores/${await throwIfEmpty(whenGotStore)}`;
        break;

      case "fx:subscription_settings":
        result = `${this._apiUrl}/store_subscription_settings/${await throwIfEmpty(whenGotStore)}`;
        break;

      case "fx:users":
      case "fx:user_accesses":
      case "fx:customers":
      case "fx:carts":
      case "fx:transactions":
      case "fx:subscriptions":
      case "fx:process_subscription_webhook":
      case "fx:item_categories":
      case "fx:taxes":
      case "fx:payment_method_sets":
      case "fx:coupons":
      case "fx:template_sets":
      case "fx:template_configs":
      case "fx:cart_templates":
      case "fx:cart_include_templates":
      case "fx:checkout_templates":
      case "fx:receipt_templates":
      case "fx:email_templates":
      case "fx:error_entries":
      case "fx:downloadables":
      case "fx:payment_gateways":
      case "fx:hosted_payment_gateways":
      case "fx:fraud_protections":
      case "fx:payment_methods_expiring":
      case "fx:store_shipping_methods":
      case "fx:integrations":
      case "fx:native_integrations":
        result = `${this._apiUrl}/stores/${await throwIfEmpty(whenGotStore)}/${rel.substring(3)}`;
        break;

      default:
        throw void 0;
    }

    this._logger.log({ level: "debug", message: `resolved offline: ${result}` });
    return result;
  }

  /**
   * Restores a full url from the path this resolver has
   * been instantiated with making as few requests as possible.
   *
   * @example
   *
   * const url = await foxy.follow("fx:store").resolve();
   *
   * @param skipCache if true, all optimizations will be disabled and the resolver will perform a full tree traversal
   */
  async resolve(skipCache = false): Promise<string> {
    let url = this._base;

    this._logger.log({
      level: "debug",
      message: `looking up ${this._path.join(" => ")}`,
    });

    for (let i = 0; i < this._path.length; ++i) {
      const args = [url, this._path[i], this._path.slice(0, i)] as const;

      this._logger.log({
        level: "debug",
        message: `[${i + 1}/${this._path.length}] ${url} => [${this._path[i].toString()}]`,
      });

      try {
        if (skipCache) {
          url = await this._traverse(...args);
        } else {
          url = await this._tryStaticResolver(...args)
            .catch(() => this._tryCacheResolver(...args))
            .catch(() => this._tryIdResolver(...args))
            .catch(() => this._traverse(...args));
        }
      } catch (err) {
        throw new ResolverResolutionError(this._path, err);
      }
    }

    this._logger.log({ level: "debug", message: `found ${url}` });
    return url;
  }
}
