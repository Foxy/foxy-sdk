import { checkArgument, v8n } from '../v8n.js';
import { Response } from 'cross-fetch';

/**
 * This error is thrown when one of the requests for a resource
 * in a path returns a non-2XX status code during the URL resolution process.
 * If you're implementing a custom resolver, consider using this class
 * to indicate resolution errors.
 */
export class ResolutionError extends Error {
  /** Available class member validators. */
  static readonly v8n = {
    constructor: v8n().instanceOf(Response),
  };

  /** API response object with a non-2XX status code. */
  readonly response: Response;

  constructor(response: Response) {
    super();
    checkArgument(ResolutionError.v8n.constructor, response, 'response');
    this.response = response;
  }
}
