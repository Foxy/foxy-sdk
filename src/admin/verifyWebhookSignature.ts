import { assertWebhookSignaturePayload } from '../core/guards.js';

interface Webhook {
  /** The `Foxy-Webhook-Signature` header value received with the webhook. */
  signature: string;
  /** The serialized (string) request body received with the webhook. */
  payload: string;
  /** The encryption key for this particular webhook. */
  key: string;
}

// SECURITY: `webhook.key` is a store secret. This function must only run in
// a trusted, authenticated context — e.g. a store admin's own dashboard
// session or your own webhook receiver — and never in code served to or
// executed by end customers. In a browser, this also requires a secure
// context (HTTPS or localhost) — globalThis.crypto.subtle is undefined
// otherwise.

/**
 * Verifies that the webhook your app has received was indeed sent from our servers.
 * See [our wiki](https://wiki.foxycart.com/v/2.0/webhooks#validating_the_payload) for more info.
 *
 * @param webhook info received with the webhook that needs validation. `webhook.key` is a
 * store secret — only ever call this in a trusted, authenticated context (e.g. a store
 * admin's own dashboard session or your own webhook receiver) — never in code served to or
 * executed by end customers.
 * @returns True if this webhook has a valid signature.
 */
export async function verifyWebhookSignature(webhook: Webhook): Promise<boolean> {
  assertWebhookSignaturePayload(webhook);

  if (webhook.key.length === 0) {
    return false;
  }

  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhook.key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBuffer = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(webhook.payload));
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return webhook.signature === computedSignature;
}
