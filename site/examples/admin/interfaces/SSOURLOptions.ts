import type { SSOURLOptions } from '@foxy.io/sdk/admin';
import { createSSOURL } from '@foxy.io/sdk/admin';

const options: SSOURLOptions = {
  domain: 'https://example.foxycart.com',
  secret: process.env.FOXY_STORE_SECRET!,
  customer: 12345,
  timestamp: Math.floor(Date.now() / 1000) + 600, // The link expires in 10 minutes.
};

const url = await createSSOURL(options);
console.log(url);
