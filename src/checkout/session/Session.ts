import {
  checkStoreOptions,
  createStore,
  defaultSessionKey,
  isSessionId,
  type SessionCookieOptions,
  type SessionStorageName,
  type SessionStore,
} from "./stores";

export type SessionOptions = {
  /** Default `"local"`. */
  storage?: SessionStorageName | SessionStore;
  /** Default `foxy.session.<store host>`. Not used with a `SessionStore` object. */
  key?: string;
  /** Only for `storage: "cookie"`. */
  cookie?: SessionCookieOptions;
  /** Default `true`: with no stored ID, the first load creates a session. */
  autoStart?: boolean;
};

/** What `Session` needs from the `API` that owns it. Not public. */
export type SessionHost = {
  storeOrigin(): string | null;
  /** Runs `action` with the client `busy`, and rethrows. */
  run<T>(action: () => Promise<T>): Promise<T>;
  /** `GET /cart` with this ID (or none: a new session), then replaces the client's json. */
  load(sessionId: string | null): Promise<void>;
  /** `POST /cart` with `empty=reset` for the current session. */
  reset(): Promise<void>;
  /** Sets the client's json to null. */
  clear(): void;
  onError(error: Error): void;
  /** Tells the sidecart: reload with this ID, or unmount for null. */
  changed(sessionId: string | null): void;
};

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * The cart session of one `API` instance: `client.session`.
 *
 * Every change runs in one queue, one at a time, so a double click or a
 * `start()` during the first load cannot make two sessions.
 */
export class Session {
  readonly #host: SessionHost;
  #options: SessionOptions = {};
  #store: SessionStore | null = null;
  #id: string | null = null;
  /**
   * True once this session owns the store: the first load ran, or the
   * merchant called `start()` or `end()`. A client hydrated from
   * server-rendered json never does, so hosted pages keep the server's own
   * session and nothing is written on the store's origin.
   */
  #managed = false;
  /** Set during `end({ reset: true })`: the reset response carries a new ID nobody asked for. */
  #ending = false;
  #queue: Promise<unknown> = Promise.resolve();
  #pendingStart: Promise<void> | null = null;

  constructor(host: SessionHost) {
    this.#host = host;
  }

  get id(): string | null {
    return this.#id;
  }

  /** Throws a `TypeError` for bad options. Call it before the store domain is set. */
  configure(options: SessionOptions): void {
    const { storage = "local", key, cookie } = options;
    if (typeof storage === "string") checkStoreOptions(storage, key, cookie);
    this.#options = options;
    this.#store = null;
  }

  /** @internal The client's first load. `API` calls it once. */
  boot(): Promise<void> {
    return this.#enqueue(async () => {
      this.#managed = true;
      const id = await this.#read();

      if (id !== null) {
        this.#id = id;
        await this.#host.load(id);
      } else if (this.#options.autoStart ?? true) {
        await this.#host.load(null);
      }
    });
  }

  /** @internal Every session ID the client sees: responses, hydrated json, sidecart reports. */
  observe(id: string | null): void {
    if (id === null || id === this.#id || this.#ending) return;

    if (!isSessionId(id)) {
      this.#host.onError(new Error("Ignored an invalid session ID."));
      return;
    }

    this.#id = id;
    if (this.#managed) void this.#write(id);
  }

  /**
   * With an `id`: adopts it. The ID is stored first, because the merchant
   * owns it, so it stays stored even if its cart then fails to load.
   *
   * Without: creates a new, empty session. The old ID is replaced only once
   * the new session exists. The old cart is not reset on the server.
   */
  start(id?: string): Promise<void> {
    if (id !== undefined) {
      if (!isSessionId(id)) {
        return Promise.reject(new TypeError("start() needs a valid session ID."));
      }

      return this.#enqueue(async () => {
        this.#managed = true;
        this.#id = id;
        await this.#write(id);
        this.#host.changed(id);
        await this.#host.load(id);
      });
    }

    // Two quick calls (a double click) must not make two sessions.
    this.#pendingStart ??= this.#enqueue(async () => {
      this.#managed = true;
      // The response's ID reaches `observe`, which stores it.
      await this.#host.load(null);
      this.#host.changed(this.#id);
    }).finally(() => {
      this.#pendingStart = null;
    });

    return this.#pendingStart;
  }

  /**
   * Forgets the session locally: the store, `client.json`, and a mounted
   * sidecart. With `reset`, first resets the cart on the server; if that
   * fails, nothing changes, so the merchant can retry.
   */
  end(options: { reset?: boolean } = {}): Promise<void> {
    return this.#enqueue(async () => {
      this.#managed = true;

      if (options.reset && this.#id !== null) {
        this.#ending = true;
        try {
          await this.#host.reset();
        } finally {
          this.#ending = false;
        }
      }

      this.#id = null;
      await this.#remove();
      this.#host.clear();
      this.#host.changed(null);
    });
  }

  /**
   * @internal For SDK modules: the current session, or a new one. Queued, so
   * it sees a first load or a `start()` still in flight.
   */
  ensure(): Promise<string | null> {
    return this.#enqueue(async () => {
      if (this.#id === null) {
        this.#managed = true;
        await this.#host.load(null);
      }

      return this.#id;
    });
  }

  #enqueue<T>(action: () => Promise<T>): Promise<T> {
    const run = this.#queue.then(() => this.#host.run(action));
    this.#queue = run.catch(() => undefined);
    return run;
  }

  /** Created on first use: the default key needs the store domain, which may come after `configure()`. */
  #currentStore(): SessionStore {
    if (this.#store) return this.#store;

    const { storage = "local", key, cookie } = this.#options;
    if (typeof storage !== "string") return (this.#store = storage);

    const origin = this.#host.storeOrigin();
    const resolvedKey = key ?? (origin === null ? null : defaultSessionKey(origin));
    if (resolvedKey === null) {
      throw new Error("Set the store domain before using the session.");
    }

    return (this.#store = createStore(storage, resolvedKey, cookie));
  }

  async #read(): Promise<string | null> {
    try {
      const value = await this.#currentStore().get();
      if (value === null || value === "") return null;
      if (isSessionId(value)) return value;
      this.#host.onError(new Error("Ignored an invalid session ID from the session store."));
    } catch (error) {
      this.#host.onError(toError(error));
    }

    return null;
  }

  /** A store failure is reported, never thrown: it must not block the cart. */
  async #write(id: string): Promise<void> {
    try {
      await this.#currentStore().set(id);
    } catch (error) {
      this.#host.onError(toError(error));
    }
  }

  async #remove(store?: SessionStore): Promise<void> {
    try {
      await (store ?? this.#currentStore()).remove();
    } catch (error) {
      this.#host.onError(toError(error));
    }
  }
}
