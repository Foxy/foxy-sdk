/** Where `client.session` keeps the session ID. Any method may be async. */
export type SessionStore = {
  get(): string | null | Promise<string | null>;
  set(id: string): void | Promise<void>;
  remove(): void | Promise<void>;
};

export type SessionCookieOptions = {
  domain?: string;
  /** Default `/`. */
  path?: string;
  /** Seconds. Omit for a cookie that ends with the browser session. */
  maxAge?: number;
  /** Default `Lax`. `None` needs an https: page. */
  sameSite?: "Strict" | "Lax" | "None";
};

export type SessionStorageName = "local" | "session" | "cookie" | "memory";

// ponytail: provisional format until the backend confirms the real one (see
// the session design spec, open question 2). This is the only place to change.
const SESSION_ID = /^[A-Za-z0-9_-]{1,128}$/;

/** RFC 6265 `token`: what a cookie name may contain. */
const COOKIE_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

const STORAGE_NAMES: readonly string[] = ["local", "session", "cookie", "memory"];

export function isSessionId(value: unknown): value is string {
  return typeof value === "string" && SESSION_ID.test(value);
}

/** `foxy.session.<host>`. A host's `:` (a port) cannot be in a cookie name. */
export function defaultSessionKey(storeOrigin: string): string {
  return `foxy.session.${new URL(storeOrigin).host.replace(/[^A-Za-z0-9.-]/g, "_")}`;
}

/**
 * Throws a `TypeError` for options `createStore` cannot use. Separate from
 * `createStore` because `configure()` must fail at the call, before the
 * store domain -- and so the default key -- may be known.
 */
export function checkStoreOptions(
  storage: SessionStorageName,
  key: string | undefined,
  cookie: SessionCookieOptions = {},
): void {
  if (!STORAGE_NAMES.includes(storage)) {
    throw new TypeError(
      `Unknown session storage "${String(storage)}". Use "local", "session", "cookie", "memory" or a SessionStore object.`,
    );
  }

  if (storage !== "cookie") return;

  if (key !== undefined && !COOKIE_NAME.test(key)) {
    throw new TypeError(`"${key}" cannot be a cookie name.`);
  }

  for (const value of [cookie.domain, cookie.path]) {
    if (value !== undefined && /[;\s]/.test(value)) {
      throw new TypeError(`"${value}" cannot be a cookie attribute.`);
    }
  }

  if (cookie.sameSite === "None" && location.protocol !== "https:") {
    throw new TypeError('sameSite "None" needs an https: page.');
  }
}

export function createStore(
  storage: SessionStorageName,
  key: string,
  cookie: SessionCookieOptions = {},
): SessionStore {
  checkStoreOptions(storage, key, cookie);
  if (storage === "memory") return memoryStore();
  if (storage === "cookie") return cookieStore(key, cookie);
  return webStore(storage === "local" ? () => localStorage : () => sessionStorage, key);
}

type SyncStore = { get(): string | null; set(id: string): void; remove(): void };

function memoryStore(): SyncStore {
  let id: string | null = null;
  return {
    get: () => id,
    set: (next) => {
      id = next;
    },
    remove: () => {
      id = null;
    },
  };
}

/** Blocked storage (private mode, a sandboxed frame) throws on access: fall back to memory. */
function webStore(storage: () => Storage, key: string): SyncStore {
  const fallback = memoryStore();
  return {
    get() {
      try {
        return storage().getItem(key);
      } catch {
        return fallback.get();
      }
    },
    set(id) {
      try {
        storage().setItem(key, id);
      } catch {
        fallback.set(id);
      }
    },
    remove() {
      fallback.remove();
      try {
        storage().removeItem(key);
      } catch {
        // Nothing was stored there.
      }
    },
  };
}

function cookieStore(key: string, options: SessionCookieOptions): SyncStore {
  const attributes = [
    `Path=${options.path ?? "/"}`,
    ...(options.domain ? [`Domain=${options.domain}`] : []),
    `SameSite=${options.sameSite ?? "Lax"}`,
    ...(location.protocol === "https:" ? ["Secure"] : []),
  ];

  const write = (value: string, maxAge: number | undefined): void => {
    document.cookie = [
      `${key}=${value}`,
      ...attributes,
      ...(maxAge === undefined ? [] : [`Max-Age=${maxAge}`]),
    ].join("; ");
  };

  return {
    get() {
      for (const pair of document.cookie.split(/;\s*/)) {
        const at = pair.indexOf("=");
        if (at > 0 && pair.slice(0, at) === key) {
          try {
            return decodeURIComponent(pair.slice(at + 1));
          } catch {
            return null;
          }
        }
      }
      return null;
    },
    set: (id) => write(encodeURIComponent(id), options.maxAge),
    remove: () => write("", 0),
  };
}
