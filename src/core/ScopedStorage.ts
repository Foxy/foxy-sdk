import ow from "ow";

export const isStorage = {
  length: ow.number,
  key: ow.function,
  getItem: ow.function,
  setItem: ow.function,
  removeItem: ow.function,
  clear: ow.function,
};

export class ScopedStorage {
  constructor(public readonly scope: string, public readonly provider: Storage) {
    ow(scope, ow.string);
    ow(provider, ow.object.partialShape(isStorage));
  }

  private get __prefix() {
    return `${this.scope}::`;
  }

  private __getScopedKey(key: string) {
    return `${this.__prefix}${key}`;
  }

  get length(): number {
    let count = 0;

    for (let i = 0; i < this.provider.length; ++i) {
      if (this.provider.key(i)?.startsWith(this.__prefix)) ++count;
    }

    return count;
  }

  key(index: number): string | null {
    ow(index, ow.number);

    for (let i = 0, j = 0; i < this.provider.length; ++i) {
      const key = this.provider.key(i);
      if (key?.startsWith(this.__prefix)) ++j;
      if (j === index) return key;
    }

    return null;
  }

  getItem(key: string): string | null {
    ow(key, ow.string);
    return this.provider.getItem(this.__getScopedKey(key));
  }

  setItem(key: string, value: string): void {
    ow(key, ow.string);
    ow(value, ow.string);
    this.provider.setItem(this.__getScopedKey(key), value);
  }

  removeItem(key: string): void {
    ow(key, ow.string);
    this.provider.removeItem(this.__getScopedKey(key));
  }

  clear(): void {
    for (let i = 0; i < this.provider.length; ++i) {
      const key = this.provider.key(i);
      if (key?.startsWith(this.__prefix)) this.provider.removeItem(key);
    }
  }
}
