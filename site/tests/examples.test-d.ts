// Every snippet shown on the section index pages (content/docs/reference/*/index.mdx). Checked with `npm run examples:check`.
// CDN imports cannot be typechecked, so those snippets use the same module through its npm subpath.
import { API as AdminAPI } from '@foxy.io/sdk/admin';
import { API as CustomerAPI } from '@foxy.io/sdk/customer';
import { getAllowedFrequencies } from '@foxy.io/sdk/customer/subscriptions';
import { client } from '@foxy.io/sdk/checkout/client';
import { sideCart } from '@foxy.io/sdk/checkout/side-cart';
import type { AddToCartDetail } from '@foxy.io/sdk/checkout/add-to-cart';

declare function save(tokens: unknown): void;
declare const callbackUrl: string;
declare function openMyCart(): void;
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

export function addToCart() {
  document.addEventListener('foxy:add-to-cart', event => {
    const { params } = (event as CustomEvent<AddToCartDetail>).detail;
    event.preventDefault();
    client.addItem(params);
    openMyCart();
  });
}

export async function clientPage() {
  // Keep the session ID in a cookie. Do this before the store domain is set.
  client.session.configure({
    storage: 'cookie',
    cookie: { maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax' },
  });

  client.setStoreDomain('example.foxycart.com');

  // Listen for changes to the cart.
  client.addEventListener('update', () => {
    console.log(client.state, client.json?.items.length ?? 0);
  });

  // Add a product with a quantity and a custom option.
  client.addItem([
    ['name', 'Mug'],
    ['price', '15'],
    ['quantity', '2'],
    ['color', 'Blue'],
  ]);

  // Apply a coupon code from your own input.
  client.applyCouponOrGiftCardCode({ code: 'SPRING10' });

  // Later, when the shopper signs out, forget the session and reset the cart.
  await client.session.end({ reset: true });
}

export function sideCartPage() {
  // Open the drawer from your own cart button.
  document.querySelector('#cart-button')?.addEventListener('click', () => {
    sideCart.show();
  });

  // Close it when the shopper presses Escape.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') sideCart.hide();
  });

  // Keep a cart badge in sync with the side cart.
  const badge = document.querySelector('#cart-badge');
  const updateBadge = () => {
    if (badge) badge.textContent = String(sideCart.itemCount ?? 0);
  };

  sideCart.addEventListener('itemcountchange', updateBadge);
  updateBadge();
}
