export interface Graph {
  readonly curie?: string;
  readonly links?: Readonly<Record<string, Graph>>;
  readonly props?: Readonly<Record<string, unknown>>;
  readonly child?: Graph;
  readonly zooms?: Readonly<Record<string, Graph | undefined>>;
}
