import * as crypto from 'crypto';

import { URL } from 'url';
import v8n from 'v8n';

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

const optionsV8N = v8n().schema({
  customer: v8n().number(),
  domain: v8n().string(),
  secret: v8n().string(),
  session: v8n().optional(v8n().string()),
  timestamp: v8n().optional(v8n().number()),
});

/**
 * Generates an SSO url for the given configuration.
 *
 * @example
 *
 * const url = FoxyApi.sso.createUrl({
 *   customer: 123,
 *   secret: "...",
 *   domain: "https://yourdomain.foxycart.com"
 * });
 *
 * @param options sso url configuration
 * @tutorial https://docs.foxycart.com/v/2.0/sso#the_details
 * @returns SSO URL as string.
 */
export function createSSOURL(options: Options): string {
  optionsV8N.check(options);

  const timestamp = options.timestamp ?? Math.floor(Date.now() / 1000) + 3600;
  const decodedToken = `${options.customer}|${timestamp}|${options.secret}`;
  const encodedToken = crypto.createHash('sha1').update(decodedToken);
  const url = new URL('/checkout', options.domain);

  url.searchParams.append('fc_customer_id', options.customer.toString());
  url.searchParams.append('fc_auth_token', encodedToken.digest('hex'));
  url.searchParams.append('timestamp', String(timestamp));

  if (typeof options.session === 'string') {
    url.searchParams.append('fcsid', options.session);
  }

  return url.toString();
}
