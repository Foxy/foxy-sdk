import { client } from '@foxy.io/sdk/checkout/client';

// The shared client is an API instance. Listen for changes to the cart.
client.addEventListener('update', () => {
  console.log(client.state, client.json?.items.length ?? 0);
});

// Apply a coupon code from your own input.
client.applyCouponOrGiftCardCode({ code: 'SPRING10' });
