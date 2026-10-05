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

/** What a request saw when it was sent. See `Session#isStale`. */
export type SessionSnapshot = { readonly id: string | null; readonly epoch: number };

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
  /**
   * Set while `end()` runs and while `start(id)` stores its ID. `observe` then
   * ignores every ID: the reset response carries one nobody asked for, and
   * the old frame can still report the ID being replaced.
   */
  #ending = false;
  #queue: Promise<unknown> = Promise.resolve();
  #pendingStart: Promise<void> | null = null;
  /** The last store write from `observe`. `start()` and `ensure()` wait for it. Never rejects. */
  #pendingWrite: Promise<void> = Promise.resolve();
  /** Bumped by every change a response in flight cannot know about. */
  #epoch = 0;

  constructor(host: SessionHost) {
    this.#host = host;
  }

  get id(): string | null {
    return this.#id;
  }

  /** @internal What a request saw when it was sent. */
  snapshot(): SessionSnapshot {
    return { id: this.#id, epoch: this.#epoch };
  }

  /**
   * @internal True when the session changed after `snapshot` was taken. The
   * response then belongs to another session and must not touch this one:
   * not its ID (the sidecart may have reported a newer one during the first
   * load) and not `client.json` (`end()` cleared it on purpose).
   */
  isStale(snapshot: SessionSnapshot): boolean {
    return snapshot.id !== this.#id || snapshot.epoch !== this.#epoch;
  }

  /**
   * @internal The store domain changed. A managed session belonged to the
   * old store: forget it here (the old store keeps it) so the client can load
   * again. Returns false for a hydrated client, which keeps its json's session.
   */
  storeChanged(): boolean {
    if (!this.#managed) return false;
    this.#epoch++;
    this.#id = null;
    this.#store = null;
    this.#managed = false;
    return true;
  }

  /** Throws a `TypeError` for bad options. Call it before the store domain is set. */
  configure(options: SessionOptions): void {
    const { storage = "local", key, cookie } = options;
    if (typeof storage === "string") checkStoreOptions(storage, key, cookie);

    const previous = this.#store;
    this.#options = options;
    this.#store = null;

    // Called after the store was first used -- late, from `checkout/loader`.
    if (previous) {
      this.#enqueue(() => this.#switchFrom(previous)).catch((error: unknown) =>
        this.#host.onError(toError(error)),
      );
    }
  }

  /**
   * The old store is emptied either way, so a switch from `"local"` to
   * `"memory"` leaves nothing in `localStorage`. It is emptied BEFORE the
   * write: the new store may be the same storage under the same key.
   */
  async #switchFrom(previous: SessionStore): Promise<void> {
    if (this.#currentStore() === previous) return;

    const adopted = await this.#read();
    await this.#remove(previous);

    if (adopted !== null && adopted !== this.#id) {
      this.#epoch++;
      this.#id = adopted;
      this.#host.changed(adopted);
      await this.#host.load(adopted);
      return;
    }

    if (this.#id !== null) await this.#write(this.#id);
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
    if (this.#managed) this.#pendingWrite = this.#write(id);
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

      // A start() queued before this one must not be joined after it.
      this.#pendingStart = null;
      return this.#enqueue(async () => {
        this.#epoch++;
        this.#managed = true;
        this.#id = id;
        this.#ending = true;
        try {
          await this.#write(id);
        } finally {
          this.#ending = false;
        }
        this.#host.changed(id);
        await this.#host.load(id);
      });
    }

    // Two quick calls (a double click) must not make two sessions.
    if (this.#pendingStart) return this.#pendingStart;

    const pending: Promise<void> = this.#enqueue(async () => {
      this.#epoch++;
      this.#managed = true;
      // The response's ID reaches `observe`, which stores it.
      await this.#host.load(null);
      await this.#pendingWrite;
      this.#host.changed(this.#id);
    }).finally(() => {
      // An older start() that finishes late must not clear a newer one.
      if (this.#pendingStart === pending) this.#pendingStart = null;
    });

    this.#pendingStart = pending;
    return pending;
  }

  /**
   * Forgets the session locally: the store, `client.json`, and a mounted
   * sidecart. With `reset`, first resets the cart on the server; if that
   * fails, nothing changes, so the merchant can retry.
   */
  end(options: { reset?: boolean } = {}): Promise<void> {
    // A start() queued before this one must not be joined after it.
    this.#pendingStart = null;
    return this.#enqueue(async () => {
      this.#epoch++;
      this.#managed = true;
      this.#ending = true;

      try {
        if (options.reset && this.#id !== null) await this.#host.reset();

        this.#id = null;
        // A write that started before this must not land after the remove.
        await this.#pendingWrite;
        await this.#remove();
        this.#host.clear();
        this.#host.changed(null);
      } finally {
        this.#ending = false;
      }
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
        await this.#pendingWrite;
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
