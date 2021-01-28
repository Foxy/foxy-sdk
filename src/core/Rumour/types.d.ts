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

export type Share = {
  readonly related?: ReadonlyArray<string>;
  readonly source: string;
  readonly data: Resource | null;
};

export type TrackCallback = (update: <TData extends Resource>(data: TData) => TData | null) => void;

export type CeaseCallback = () => void;

export type Patch = Map<string, Record<string, unknown> | null>;
