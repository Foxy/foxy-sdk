export interface CustomStorageSetOptions {
  /** Date when this entry becomes expired. */
  expires?: Date | null;
}

export interface CustomStorage extends Storage {
  setItem(key: string, value: string, options?: CustomStorageSetOptions): void;
}
