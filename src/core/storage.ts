/**
 * Minimal in-memory implementation of the
 * [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
 * Used as the default for `storage` and `cache` on API clients. Replaces the
 * `fake-storage` dependency v1 used for the same purpose.
 */
export class MemoryStorage implements Storage {
  [key: string]: unknown;

  #items = new Map<string, string>();

  get length(): number {
    return this.#items.size;
  }

  clear(): void {
    this.#items.clear();
  }

  getItem(key: string): string | null {
    return this.#items.get(String(key)) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.#items.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.#items.delete(String(key));
  }

  setItem(key: string, value: string): void {
    this.#items.set(String(key), String(value));
  }
}
