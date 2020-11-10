import * as crypto from 'crypto';

import v8n from 'v8n';

interface Webhook {
  /** The `Foxy-Webhook-Signature` header value received with the webhook. */
  signature: string;
  /** The serialized (string) request body received with the webhook. */
  payload: string;
  /** The encryption key for this particular webhook. */
  key: string;
}

const webhookV8N = v8n().schema({
  key: v8n().string(),
  payload: v8n().string(),
  signature: v8n().string(),
});

/**
 * Verifies that the webhook your app has received was indeed sent from our servers.
 * See [our wiki](https://wiki.foxycart.com/v/2.0/webhooks#validating_the_payload) for more info.
 *
 * @param webhook info received with the webhook that needs validation
 * @returns True if this webhook has a valid signature.
 */
export function verifyWebhookSignature(webhook: Webhook): boolean {
  webhookV8N.check(webhook);
  const computedSignature = crypto.createHmac('sha256', webhook.key).update(webhook.payload).digest('hex');
  return webhook.signature === computedSignature;
}
