export class APIResolutionError extends Error {
  constructor(public readonly response: Response) {
    super();
  }
}
