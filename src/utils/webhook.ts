import * as crypto from 'crypto';

export interface VerificationParams {
  /**
   * The `Foxy-Webhook-Signature` header value received with the webhook.
   *
   * @see https://wiki.foxycart.com/v/2.0/webhooks
   */
  signature: string;

  /**
   * The serialized (string) request body received with the webhook.
   *
   * @see https://wiki.foxycart.com/v/2.0/webhooks
   */
  payload: string;

  /**
   * The encryption key for this particular webhook.
   *
   * @see https://wiki.foxycart.com/v/2.0/webhooks
   */
  key: string;
}

/**
 * Verifies that the webhook your app has received was indeed sent from our servers.
 *
 * @example
 *
 * const isVerified = FoxyApi.webhook.verify({
 *   signature: "...",
 *   payload: "...",
 *   key: "..."
 * });
 *
 * @param params info received with the webhook that needs validation
 * @tutorial https://wiki.foxycart.com/v/2.0/webhooks#validating_the_payload
 */
export function verify(params: VerificationParams): boolean {
  const computedSignature = crypto.createHmac('sha256', params.key).update(params.payload).digest('hex');

  return params.signature === computedSignature;
}
