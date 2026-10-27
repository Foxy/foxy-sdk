// Every snippet shown on the section index pages (content/docs/reference/*/index.mdx). Checked with `npm run examples:check`.
// CDN imports cannot be typechecked, so those snippets use the same module through its npm subpath.
import { API as AdminAPI } from '@foxy.io/sdk/admin';
import { API as CustomerAPI, getAllowedFrequencies } from '@foxy.io/sdk/customer';
import { client } from '@foxy.io/sdk/checkout/client';
import { sideCart } from '@foxy.io/sdk/checkout/side-cart';

declare function save(tokens: unknown): void;
declare const callbackUrl: string;
declare const savedState: string;
declare const settings: Parameters<typeof getAllowedFrequencies>[0]['settings'];
declare const subscription: Parameters<typeof getAllowedFrequencies>[0]['subscription'];

export async function admin() {
  const api = new AdminAPI({
    clientId: 'client_123',
    clientSecret: 'secret_123',
    redirectUri: 'https://example.com/callback',
  });

  // Step 1: send the user here.
  const url: string = api.signIn({ state: 'random-value', scope: 'store_full_access' });

  // Step 2: on the redirect back to your site.
  const tokens = await api.confirmSignIn(callbackUrl, savedState);

  // Later: restore saved tokens, and save new ones when they are refreshed.
  api.setTokens(tokens);
  api.addEventListener('tokens', event => save(event.detail));
  return url;
}

export async function customer() {
  const api = new CustomerAPI({ base: new URL('https://example.foxycart.com/s/customer/') });
  await api.signIn({ email: 'customer@example.com', password: 'password' });

  const frequencies: string[] = [...getAllowedFrequencies({ settings, subscription })];
  return frequencies;
}

export function checkout() {
  client.setStoreDomain('example.foxycart.com');

  client.addItem([
    ['name', 'Mug'],
    ['price', '15'],
  ]);

  sideCart.show();
  sideCart.hide();
  sideCart.addEventListener('itemcountchange', () => console.log(sideCart.itemCount));
}
