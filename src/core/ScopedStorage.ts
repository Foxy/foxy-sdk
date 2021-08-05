import type { CustomStorage, CustomStorageSetOptions } from './API/CustomStorage';

export interface ScopedStorageOptions {
  /** Scope to prefix item names with, e.g. scoping `customer` with `fx` will create an item named `fx.customer` in the storage. */
  scope: string;
  /** Storage instance implementing [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) to operate on. */
  target: CustomStorage;
}

/**
 * [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) wrapper
 * working only with the items in the given scope.
 */
export class ScopedStorage implements CustomStorage {
  private __scope: string;

  private __target: CustomStorage;

  constructor(options: ScopedStorageOptions) {
    this.__scope = options.scope;
    this.__target = options.target;
  }

  key(index: number): string | null {
    const length = this.__target.length;

    for (let scopedIndex = -1, targetIndex = 0; targetIndex < length; ++targetIndex) {
      const key = this.__target.key(targetIndex);
      if (key !== null && this.__isScopedKey(key)) {
        ++scopedIndex;
        if (scopedIndex === index) return this.__getUnscopedKey(key);
      }
    }

    return null;
  }

  getItem(key: string): string | null {
    return this.__target.getItem(this.__getScopedKey(key));
  }

  setItem(key: string, value: string, options?: CustomStorageSetOptions): void {
    this.__target.setItem(this.__getScopedKey(key), value, options);
  }

  removeItem(key: string): void {
    this.__target.removeItem(this.__getScopedKey(key));
  }

  clear(): void {
    for (let index = 0; index < this.__target.length; ) {
      const key = this.__target.key(index);

      if (key !== null && this.__isScopedKey(key)) {
        this.__target.removeItem(key);
      } else {
        ++index;
      }
    }
  }

  get length(): number {
    let sum = 0;

    for (let index = 0; index < this.__target.length; ++index) {
      const key = this.__target.key(index);
      if (key !== null && this.__isScopedKey(key)) ++sum;
    }

    return sum;
  }

  private __isScopedKey(key: string): boolean {
    return key.startsWith(`${this.__scope}.`) && key.length > this.__scope.length + 1;
  }

  private __getScopedKey(key: string): string {
    return `${this.__scope}.${key}`;
  }

  private __getUnscopedKey(key: string): string {
    return key.substring(this.__scope.length + 1);
  }
}
