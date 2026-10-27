import { createSSOURL } from '@foxy.io/sdk/admin';

// Send a signed-in customer to checkout without asking them to log in again.
const url = await createSSOURL({
  domain: 'https://example.foxycart.com',
  secret: process.env.FOXY_STORE_SECRET!,
  customer: 12345,
});

console.log(url);
