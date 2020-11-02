export interface APIGraph {
  readonly curie?: string;
  readonly links?: Readonly<Record<string, APIGraph>>;
  readonly props?: Readonly<Record<string, unknown>>;
  readonly child?: APIGraph;
  readonly zooms?: Readonly<Record<string, APIGraph | undefined>>;
}
