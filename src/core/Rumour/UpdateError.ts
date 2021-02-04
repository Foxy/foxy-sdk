export class UpdateError extends Error {
  constructor() {
    super('not enough info to update; please reload resource instead');
  }
}
