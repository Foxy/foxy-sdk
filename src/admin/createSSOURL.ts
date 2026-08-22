import { assertSSOURLOptions } from '../core/guards.js';

interface Options {
  /**
   * Integer, epoch time (seconds). The future time that this authentication token will expire.
   * If a customer makes a checkout request with an expired authentication token, then FoxyCart
   * will redirect them to the endpoint in order to generate a new token. You can make use of the
   * timestamp value you received to your endpoint in the GET parameters, and add additional time
   * to it for how long you want it to be valid for. For example, adding 3600 to the timestamp will
   * extend it by 3600 seconds, or 60 minutes.
   *
   * Defaults to an hour from now.
   *
   * @see https://docs.foxycart.com/v/2.0/sso#the_details
   */
  timestamp?: number;

  /**
   * The FoxyCart session ID. This is necessary to prevent issues with users with 3rd party cookies
   * disabled and stores that are not using a custom subdomain.
   *
   * @see https://docs.foxycart.com/v/2.0/sso#the_details
   */
  session?: string;

  /**
   * Integer, the customer ID, as determined and stored when the user is first created or synched using the API.
   * If a customer is not authenticated and you would like to allow them through to checkout,
   * enter a customer ID of 0 (the number).
   *
   * @see https://docs.foxycart.com/v/2.0/sso#the_details
   */
  customer: number;

  /**
   * Store's {@link https://docs.foxycart.com/v/2.0/store_secret secret key}.
   * A random 60 character key that helps secure sensitive information provided by some of our functionality.
   *
   * @see https://docs.foxycart.com/v/2.0/sso#the_details
   */
  secret: string;

  /**
   * The unique FoxyCart subdomain URL for your cart, checkout, and receipt
   * that usually looks like this: `https://yourdomain.foxycart.com`.
   *
   * @see https://docs.foxycart.com/v/2.0/sso#the_details
   * @see https://api.foxy.io/rels/store
   */
  domain: string;
}

// SECURITY: `options.secret` is the store's API key. This function must only
// run in a trusted, authenticated context — e.g. a store admin's own
// dashboard session — and never in code served to or executed by end
// customers.

/**
 * Generates an SSO url for the given configuration.
 *
 * @example
 *
 * const url = await FoxySDK.Admin.createSSOURL({
 *   customer: 123,
 *   secret: "...",
 *   domain: "https://yourdomain.foxycart.com"
 * });
 *
 * @param options sso url configuration
 * @tutorial https://docs.foxycart.com/v/2.0/sso#the_details
 * @returns SSO URL as string.
 */
export async function createSSOURL(options: Options): Promise<string> {
  assertSSOURLOptions(options);

  const timestamp = options.timestamp ?? Math.floor(Date.now() / 1000) + 3600;
  const decodedToken = `${options.customer}|${timestamp}|${options.secret}`;
  const digestBuffer = await globalThis.crypto.subtle.digest('SHA-1', new TextEncoder().encode(decodedToken));
  const encodedToken = Array.from(new Uint8Array(digestBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  const url = new URL('/checkout', options.domain);

  url.searchParams.append('fc_customer_id', options.customer.toString());
  url.searchParams.append('fc_auth_token', encodedToken);
  url.searchParams.append('timestamp', String(timestamp));

  if (typeof options.session === 'string') {
    url.searchParams.append('fcsid', options.session);
  }

  return url.toString();
}
