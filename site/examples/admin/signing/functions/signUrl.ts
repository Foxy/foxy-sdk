import { signUrl } from '@foxy.io/sdk/admin/signing';

// The URL must have a `code` field. All query fields are signed.
const url = await signUrl(
  process.env.FOXY_STORE_SECRET!,
  'https://example.foxycart.com/cart?name=Mug&price=10&code=mug',
);

console.log(url);
