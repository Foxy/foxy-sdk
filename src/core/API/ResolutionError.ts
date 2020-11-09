import { Response } from 'cross-fetch';
import v8n from 'v8n';

/**
 * This error is thrown when one of the requests for a resource
 * in a path returns a non-2XX status code during the URL resolution process.
 * If you're implementing a custom resolver, consider using this class
 * to indicate resolution errors.
 */
export class ResolutionError extends Error {
  /** API response object with a non-2XX status code. */
  readonly response: Response;

  constructor(response: Response) {
    super();
    v8n().instanceOf(Response).check(response);
    this.response = response;
  }
}
