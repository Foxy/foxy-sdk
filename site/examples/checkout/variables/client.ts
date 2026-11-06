import { client } from 'https://cdn-js.foxy.io/sdk@2/checkout.js';

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
