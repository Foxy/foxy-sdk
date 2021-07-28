export type Collection = Resource & {
  readonly _links: {
    readonly first: {
      readonly href: string;
    };
  };
};

export type Resource = {
  readonly _links: {
    readonly self: {
      readonly href: string;
    };
  };
};

export type Share<T extends Resource = Resource> = {
  /** URIs of resources affected by this update. */
  readonly related?: ReadonlyArray<string>;

  /** URI of the updated resource. */
  readonly source: string;

  /** Updated resource or null if it's deleted. */
  readonly data: T | null;
};

export type TrackCallback = (update: <TData extends Resource>(data: TData) => TData | null) => void;

export type CeaseCallback = () => void;

export type Patch = Map<string, Record<string, unknown> | null>;
