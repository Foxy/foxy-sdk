import { verifyWebhookSignature } from '@foxy.io/sdk/admin';

// Call this in your webhook handler with the raw request body.
export async function handleWebhook(request: Request): Promise<Response> {
  const isValid = await verifyWebhookSignature({
    signature: request.headers.get('Foxy-Webhook-Signature') ?? '',
    payload: await request.text(),
    key: process.env.FOXY_WEBHOOK_KEY!,
  });

  return new Response(isValid ? 'ok' : 'invalid signature', { status: isValid ? 200 : 401 });
}
