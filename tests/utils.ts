/** Storage that keeps items in an enumerable own property, so inspecting it prints them. */
export class VisibleStorage {
  items: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.items).length;
  }

  key(index: number): string | null {
    return Object.keys(this.items)[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.items[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.items[key] = value;
  }

  removeItem(key: string): void {
    delete this.items[key];
  }

  clear(): void {
    this.items = {};
  }
}

/**
 * JSON.stringify that skips circular references instead of throwing.
 *
 * @param value Value to serialize.
 * @returns JSON string.
 */
export function safeStringify(value: unknown): string {
  const seen = new WeakSet();

  return JSON.stringify(value, (_key, item) => {
    if (typeof item === 'object' && item !== null) {
      if (seen.has(item)) return undefined;
      seen.add(item);
    }

    return item;
  });
}
