import { Headers, Response } from 'cross-fetch';

/**
 * Checks whether a value is an instance of the `Response` class used by this SDK.
 * Returns a plain boolean on purpose: a custom fetch may return a different `Response` class
 * that TypeScript can't tell apart from this one.
 *
 * @param value Value to check.
 * @returns True if the value is an instance of the SDK's `Response` class.
 */
const isSDKResponse = (value: unknown): boolean => value instanceof Response;

/** `Request` properties that are also `fetch()` options. */
const REQUEST_OPTIONS = [
  'cache',
  'credentials',
  'integrity',
  'keepalive',
  'mode',
  'redirect',
  'referrer',
  'referrerPolicy',
  'signal',
] as const;

/** Function with the same signature as WHATWG fetch. */
export type Fetch = Window['fetch'];

/**
 * Sends a request built by the SDK with a user-provided fetch. The request is passed
 * as a URL and plain options (rather than a `Request` instance) so that any WHATWG-compatible
 * fetch works, including ones whose `Request` class differs from the one this SDK uses.
 * Responses that aren't instances of the SDK's `Response` class are copied into one, so
 * `instanceof` checks elsewhere in the SDK keep working.
 *
 * @param customFetch User-provided fetch.
 * @param request Request to send.
 * @param init Original request options (used for options such as `signal` that the request doesn't carry over).
 * @returns Fetch API response.
 */
export async function sendWithCustomFetch(customFetch: Fetch, request: Request, init?: RequestInit): Promise<Response> {
  const method = request.method.toUpperCase();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => (headers[key] = value));

  let body: ArrayBuffer | undefined;

  if (method !== 'GET' && method !== 'HEAD') {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > 0) body = buffer;
  }

  // Carry over the options the request holds (such as `signal` or `redirect`), skipping ones the
  // SDK's Request class doesn't set. Options in `init` win, since some Request classes drop them.
  const requestOptions: Record<string, unknown> = {};
  REQUEST_OPTIONS.forEach(key => {
    const value = ((request as unknown) as Record<string, unknown>)[key];
    if (value !== undefined && value !== null) requestOptions[key] = value;
  });

  const response = await customFetch(request.url, { ...requestOptions, ...init, body, headers, method });
  if (isSDKResponse(response)) return response;

  const nullBody = [101, 204, 205, 304].indexOf(response.status) !== -1;
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => responseHeaders.append(key, value));

  return new Response(nullBody ? null : await response.arrayBuffer(), {
    headers: responseHeaders,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  } as ResponseInit);
}
